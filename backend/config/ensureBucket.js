// config/ensureBucket.js
const supabase = require("./supabase");

async function ensureBucket(name = "application-files") {
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw listErr;

  const exists = buckets?.some(b => b.name === name);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (createErr) throw createErr;
    console.log(`✅ Created bucket: ${name}`);
  } else {
    console.log(`✅ Bucket exists: ${name}`);
  }
}

module.exports = ensureBucket;
