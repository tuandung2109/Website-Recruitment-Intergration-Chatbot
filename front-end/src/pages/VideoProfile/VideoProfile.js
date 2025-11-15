import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Progress, message, Modal, Select, Upload } from "antd";
import {
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  RedoOutlined,
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import "./VideoProfile.css";

const { Option } = Select;

const VideoProfile = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxDuration, setMaxDuration] = useState(60); // 60 seconds default
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      message.success("Camera đã sẵn sàng!");
    } catch (error) {
      message.error("Không thể truy cập camera. Vui lòng cho phép quyền truy cập!");
      console.error("Camera error:", error);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!streamRef.current) {
      message.error("Vui lòng bật camera trước!");
      return;
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorderRef.current = mediaRecorder;
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      setRecordedChunks(chunks);
      setIsPreviewMode(true);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= maxDuration) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            if (prev >= maxDuration) {
              stopRecording();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  // Reset recording
  const resetRecording = () => {
    setRecordedVideoUrl(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    setIsPreviewMode(false);
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Save video
  const saveVideo = () => {
    if (!recordedVideoUrl) {
      message.error("Không có video để lưu!");
      return;
    }

    const newVideo = {
      id: Date.now(),
      url: recordedVideoUrl,
      duration: recordingTime,
      createdAt: new Date().toISOString(),
      title: `Video CV - ${new Date().toLocaleDateString("vi-VN")}`,
    };

    setSavedVideos([newVideo, ...savedVideos]);
    message.success("Video đã được lưu thành công!");
    resetRecording();
  };

  // Delete saved video
  const deleteVideo = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa video này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        setSavedVideos(savedVideos.filter((v) => v.id !== id));
        message.success("Đã xóa video!");
      },
    });
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="video-profile-container">
      <div className="video-profile-header">
        <h1>
          <VideoCameraOutlined /> Video Profile / Video CV
        </h1>
        <p>Tạo video giới thiệu bản thân chuyên nghiệp trong 30-60 giây</p>
      </div>

      <div className="video-profile-content">
        {/* Recording Section */}
        <Card className="recording-card">
          <div className="recording-header">
            <h2>🎬 Quay Video</h2>
            <Select
              value={maxDuration}
              onChange={setMaxDuration}
              style={{ width: 150 }}
              disabled={isRecording}
            >
              <Option value={30}>30 giây</Option>
              <Option value={45}>45 giây</Option>
              <Option value={60}>60 giây</Option>
              <Option value={90}>90 giây</Option>
            </Select>
          </div>

          <div className="video-container">
            {!isPreviewMode ? (
              <div className="camera-view">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="video-element"
                />
                {!cameraReady && (
                  <div className="camera-placeholder">
                    <VideoCameraOutlined style={{ fontSize: 64 }} />
                    <p>Camera chưa được bật</p>
                  </div>
                )}
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    REC
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-view">
                <video
                  src={recordedVideoUrl}
                  controls
                  className="video-element"
                />
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="recording-controls">
            {!isPreviewMode ? (
              <>
                {!cameraReady ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<VideoCameraOutlined />}
                    onClick={startCamera}
                  >
                    Bật Camera
                  </Button>
                ) : (
                  <>
                    {!isRecording ? (
                      <Button
                        type="primary"
                        size="large"
                        danger
                        icon={<PlayCircleOutlined />}
                        onClick={startRecording}
                      >
                        Bắt đầu quay
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="large"
                          icon={
                            isPaused ? (
                              <PlayCircleOutlined />
                            ) : (
                              <PauseCircleOutlined />
                            )
                          }
                          onClick={pauseRecording}
                        >
                          {isPaused ? "Tiếp tục" : "Tạm dừng"}
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          onClick={stopRecording}
                        >
                          Dừng quay
                        </Button>
                      </>
                    )}
                    {cameraReady && !isRecording && (
                      <Button size="large" onClick={stopCamera}>
                        Tắt Camera
                      </Button>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={saveVideo}
                >
                  Lưu Video
                </Button>
                <Button
                  size="large"
                  icon={<RedoOutlined />}
                  onClick={resetRecording}
                >
                  Quay lại
                </Button>
              </>
            )}
          </div>

          {/* Timer and Progress */}
          {(isRecording || isPreviewMode) && (
            <div className="recording-stats">
              <div className="timer">
                <span className="time-display">{formatTime(recordingTime)}</span>
                <span className="time-max">/ {formatTime(maxDuration)}</span>
              </div>
              <Progress
                percent={(recordingTime / maxDuration) * 100}
                showInfo={false}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
            </div>
          )}

          {/* Tips */}
          <div className="recording-tips">
            <h3>💡 Tips để có video CV tốt:</h3>
            <ul>
              <li>✅ Chọn nơi có ánh sáng tốt, tránh ngược sáng</li>
              <li>✅ Mặc trang phục chuyên nghiệp, gọn gàng</li>
              <li>✅ Nói rõ ràng, tự tin và mỉm cười</li>
              <li>✅ Giới thiệu: Tên, kinh nghiệm, kỹ năng nổi bật</li>
              <li>✅ Nêu mục tiêu nghề nghiệp và điểm mạnh</li>
            </ul>
          </div>
        </Card>

        {/* Saved Videos Gallery */}
        <Card className="gallery-card">
          <h2>📹 Video CV Của Bạn</h2>

          {savedVideos.length === 0 ? (
            <div className="empty-gallery">
              <VideoCameraOutlined style={{ fontSize: 64, color: "#ccc" }} />
              <p>Chưa có video nào được lưu</p>
              <p className="empty-hint">Hãy quay video CV đầu tiên của bạn!</p>
            </div>
          ) : (
            <div className="video-gallery">
              {savedVideos.map((video) => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail">
                    <video src={video.url} className="thumbnail-video" />
                    <div className="video-overlay">
                      <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedVideo(video)}
                      />
                    </div>
                  </div>
                  <div className="video-info">
                    <h4>{video.title}</h4>
                    <p className="video-duration">
                      ⏱️ {formatTime(video.duration)}
                    </p>
                    <p className="video-date">
                      {new Date(video.createdAt).toLocaleString("vi-VN")}
                    </p>
                    <div className="video-actions">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setSelectedVideo(video)}
                      >
                        Xem
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => deleteVideo(video.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Video Preview Modal */}
      <Modal
        title="Xem Video CV"
        open={!!selectedVideo}
        onCancel={() => setSelectedVideo(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedVideo(null)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              const a = document.createElement("a");
              a.href = selectedVideo.url;
              a.download = `${selectedVideo.title}.webm`;
              a.click();
              message.success("Đang tải xuống video...");
            }}
          >
            Tải xuống
          </Button>,
        ]}
        width={800}
      >
        {selectedVideo && (
          <div className="modal-video-container">
            <video src={selectedVideo.url} controls className="modal-video" />
            <div className="modal-video-info">
              <p>
                <strong>Thời lượng:</strong> {formatTime(selectedVideo.duration)}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(selectedVideo.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoProfile;
