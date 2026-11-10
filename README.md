# EMIS EIIN Lookup — Combined v2 (জন্ম তারিখসহ)

EIIN দিলেই প্রতিষ্ঠানের সব শিক্ষক/কর্মচারীর তথ্য **জন্ম তারিখসহ** একসাথে দেখায়।
আগের লুকআপ অ্যাপ (emis-eiin-lookup-gbbs-projects.vercel.app) + EMIS
রেজিস্ট্রেশন লুকআপ — দুইটা সোর্সের কম্বিনেশন।

## কীভাবে কাজ করে
- `index.html` — একটাই পেজ। EIIN লিখে খুঁজুন → শিক্ষক তালিকা আসে,
  তারপর প্রত্যেকের জন্ম তারিখ আলাদাভাবে এনে টেবিলে বসে।
- `api/ein.js` — শিক্ষক তালিকা: আগের পাবলিক লুকআপ API-র প্রক্সি
  (emis-eiin-lookup-gbbs-projects.vercel.app/api/ein)।
- `api/dob.js` — জন্ম তারিখ: EMIS-এর পাবলিক সার্ভিস
  `POST /emis/Services/HRM/Public/GetEmployeeInfo` (`{"EmpText": "<EmpId>"}`) —
  রেজিস্ট্রেশন ফরমে আইডি লিখে Tab চাপলে যে সার্ভিসটা ডাকে, ঠিক সেটা।
  একসাথে সর্বোচ্চ ৩০০টি আইডি, ১০টি করে প্যারালাল কল।

## গোপনীয়তা
`api/dob.js` শুধু `EmpId → জন্ম তারিখ (YYYY-MM-DD)` ফেরত দেয়।
EMIS-এর জবাবে NID, বাবা-মায়ের নামও থাকে — সেগুলো কখনো ফেরত দেওয়া,
লগ করা বা সংরক্ষণ করা হয় না।

## ডেপ্লয় (Vercel drag-drop)
1. এই ফোল্ডারের সব ফাইল (`index.html`, `api/`) একসাথে Vercel-এ
   drag-drop করুন (আগের প্রজেক্টে আপডেট হিসেবে, বা নতুন প্রজেক্ট হিসেবে)।
2. কোনো environment variable লাগে না, কোনো build step নেই।

## লোকাল টেস্ট
`node -e "require('./api/dob.js')({query:{ids:'00009482'}},{status(c){this.c=c;return this},json(o){console.log(o)},setHeader(){}})"`
— `{"ok":true,"dob":{"00009482":"1970-02-25"},...}` আসা উচিত।
