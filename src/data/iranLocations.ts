// Complete list of Iranian provinces and their cities
export interface City {
  name: string;
}

export interface Province {
  name: string;
  cities: City[];
}

export const iranProvinces: Province[] = [
  {
    name: "آذربایجان شرقی",
    cities: [
      { name: "تبریز" },
      { name: "مراغه" },
      { name: "مرند" },
      { name: "میانه" },
      { name: "اهر" },
      { name: "بناب" },
      { name: "سراب" },
      { name: "شبستر" },
      { name: "ملکان" },
      { name: "هشترود" },
      { name: "بستان‌آباد" },
      { name: "آذرشهر" },
      { name: "اسکو" },
      { name: "جلفا" },
      { name: "هادیشهر" },
      { name: "کلیبر" },
      { name: "خداآفرین" },
      { name: "ورزقان" },
      { name: "چاراویماق" },
      { name: "عجب‌شیر" }
    ]
  },
  {
    name: "آذربایجان غربی",
    cities: [
      { name: "ارومیه" },
      { name: "خوی" },
      { name: "میاندوآب" },
      { name: "مهاباد" },
      { name: "سلماس" },
      { name: "بوکان" },
      { name: "نقده" },
      { name: "پیرانشهر" },
      { name: "سردشت" },
      { name: "شاهین‌دژ" },
      { name: "تکاب" },
      { name: "اشنویه" },
      { name: "ماکو" },
      { name: "چالدران" },
      { name: "شوط" },
      { name: "پلدشت" },
      { name: "چایپاره" }
    ]
  },
  {
    name: "اردبیل",
    cities: [
      { name: "اردبیل" },
      { name: "مشگین‌شهر" },
      { name: "پارس‌آباد" },
      { name: "خلخال" },
      { name: "گرمی" },
      { name: "بیله‌سوار" },
      { name: "نمین" },
      { name: "نیر" },
      { name: "کوثر" },
      { name: "سرعین" }
    ]
  },
  {
    name: "اصفهان",
    cities: [
      { name: "اصفهان" },
      { name: "کاشان" },
      { name: "خمینی‌شهر" },
      { name: "نجف‌آباد" },
      { name: "شاهین‌شهر" },
      { name: "فلاورجان" },
      { name: "لنجان" },
      { name: "مبارکه" },
      { name: "گلپایگان" },
      { name: "شهرضا" },
      { name: "سمیرم" },
      { name: "فریدن" },
      { name: "فریدون‌شهر" },
      { name: "اردستان" },
      { name: "نائین" },
      { name: "تیران و کرون" },
      { name: "چادگان" },
      { name: "خوانسار" },
      { name: "دهاقان" },
      { name: "برخوار" },
      { name: "آران و بیدگل" },
      { name: "نطنز" },
      { name: "بوئین و میاندشت" }
    ]
  },
  {
    name: "البرز",
    cities: [
      { name: "کرج" },
      { name: "فردیس" },
      { name: "نظرآباد" },
      { name: "ساوجبلاغ" },
      { name: "طالقان" },
      { name: "اشتهارد" },
      { name: "چهارباغ" }
    ]
  },
  {
    name: "ایلام",
    cities: [
      { name: "ایلام" },
      { name: "دهلران" },
      { name: "ایوان" },
      { name: "مهران" },
      { name: "آبدانان" },
      { name: "دره‌شهر" },
      { name: "چرداول" },
      { name: "ملکشاهی" },
      { name: "بدره" },
      { name: "سیروان" }
    ]
  },
  {
    name: "بوشهر",
    cities: [
      { name: "بوشهر" },
      { name: "دشتستان" },
      { name: "دشتی" },
      { name: "تنگستان" },
      { name: "گناوه" },
      { name: "دیر" },
      { name: "دیلم" },
      { name: "کنگان" },
      { name: "جم" },
      { name: "عسلویه" }
    ]
  },
  {
    name: "تهران",
    cities: [
      { name: "تهران" },
      { name: "شهریار" },
      { name: "اسلامشهر" },
      { name: "ری" },
      { name: "پاکدشت" },
      { name: "ورامین" },
      { name: "رباط‌کریم" },
      { name: "قدس" },
      { name: "ملارد" },
      { name: "بهارستان" },
      { name: "پردیس" },
      { name: "دماوند" },
      { name: "پیشوا" },
      { name: "فیروزکوه" },
      { name: "قرچک" },
      { name: "شمیرانات" }
    ]
  },
  {
    name: "چهارمحال و بختیاری",
    cities: [
      { name: "شهرکرد" },
      { name: "بروجن" },
      { name: "فارسان" },
      { name: "لردگان" },
      { name: "کوهرنگ" },
      { name: "اردل" },
      { name: "کیار" },
      { name: "سامان" },
      { name: "بن" }
    ]
  },
  {
    name: "خراسان جنوبی",
    cities: [
      { name: "بیرجند" },
      { name: "قائنات" },
      { name: "فردوس" },
      { name: "طبس" },
      { name: "نهبندان" },
      { name: "سربیشه" },
      { name: "درمیان" },
      { name: "بشرویه" },
      { name: "خوسف" },
      { name: "سرایان" },
      { name: "زیرکوه" }
    ]
  },
  {
    name: "خراسان رضوی",
    cities: [
      { name: "مشهد" },
      { name: "نیشابور" },
      { name: "سبزوار" },
      { name: "تربت‌حیدریه" },
      { name: "تربت‌جام" },
      { name: "کاشمر" },
      { name: "قوچان" },
      { name: "گناباد" },
      { name: "خواف" },
      { name: "تایباد" },
      { name: "چناران" },
      { name: "فریمان" },
      { name: "درگز" },
      { name: "بردسکن" },
      { name: "سرخس" },
      { name: "بجستان" },
      { name: "خلیل‌آباد" },
      { name: "رشتخوار" },
      { name: "زاوه" },
      { name: "مه‌ولات" },
      { name: "جغتای" },
      { name: "جوین" },
      { name: "فیروزه" },
      { name: "باخرز" },
      { name: "کلات" },
      { name: "بینالود" },
      { name: "داورزن" }
    ]
  },
  {
    name: "خراسان شمالی",
    cities: [
      { name: "بجنورد" },
      { name: "شیروان" },
      { name: "اسفراین" },
      { name: "جاجرم" },
      { name: "آشخانه" },
      { name: "فاروج" },
      { name: "مانه و سملقان" },
      { name: "گرمه" },
      { name: "راز و جرگلان" }
    ]
  },
  {
    name: "خوزستان",
    cities: [
      { name: "اهواز" },
      { name: "دزفول" },
      { name: "آبادان" },
      { name: "خرمشهر" },
      { name: "بندر ماهشهر" },
      { name: "شوشتر" },
      { name: "اندیمشک" },
      { name: "بهبهان" },
      { name: "ایذه" },
      { name: "شوش" },
      { name: "رامهرمز" },
      { name: "مسجدسلیمان" },
      { name: "لالی" },
      { name: "هفتکل" },
      { name: "باغ‌ملک" },
      { name: "امیدیه" },
      { name: "شادگان" },
      { name: "هندیجان" },
      { name: "گتوند" },
      { name: "کارون" },
      { name: "حمیدیه" },
      { name: "هویزه" },
      { name: "آغاجاری" }
    ]
  },
  {
    name: "زنجان",
    cities: [
      { name: "زنجان" },
      { name: "ابهر" },
      { name: "خدابنده" },
      { name: "خرمدره" },
      { name: "ماهنشان" },
      { name: "طارم" },
      { name: "ایجرود" },
      { name: "سلطانیه" }
    ]
  },
  {
    name: "سمنان",
    cities: [
      { name: "سمنان" },
      { name: "شاهرود" },
      { name: "دامغان" },
      { name: "گرمسار" },
      { name: "مهدیشهر" },
      { name: "آرادان" },
      { name: "میامی" },
      { name: "سرخه" }
    ]
  },
  {
    name: "سیستان و بلوچستان",
    cities: [
      { name: "زاهدان" },
      { name: "چابهار" },
      { name: "ایرانشهر" },
      { name: "زابل" },
      { name: "سراوان" },
      { name: "خاش" },
      { name: "نیکشهر" },
      { name: "کنارک" },
      { name: "دلگان" },
      { name: "سرباز" },
      { name: "زهک" },
      { name: "هیرمند" },
      { name: "نیمروز" },
      { name: "هامون" },
      { name: "میرجاوه" },
      { name: "مهرستان" },
      { name: "فنوج" },
      { name: "قصرقند" }
    ]
  },
  {
    name: "فارس",
    cities: [
      { name: "شیراز" },
      { name: "مرودشت" },
      { name: "کازرون" },
      { name: "جهرم" },
      { name: "فسا" },
      { name: "لارستان" },
      { name: "داراب" },
      { name: "اقلید" },
      { name: "نی‌ریز" },
      { name: "آباده" },
      { name: "فیروزآباد" },
      { name: "ممسنی" },
      { name: "سپیدان" },
      { name: "پاسارگاد" },
      { name: "خرامه" },
      { name: "سروستان" },
      { name: "زرین‌دشت" },
      { name: "استهبان" },
      { name: "بوانات" },
      { name: "خنج" },
      { name: "کوار" },
      { name: "رستم" },
      { name: "قیروکارزین" },
      { name: "مهر" },
      { name: "گراش" },
      { name: "لامرد" },
      { name: "اوز" },
      { name: "فراشبند" }
    ]
  },
  {
    name: "قزوین",
    cities: [
      { name: "قزوین" },
      { name: "تاکستان" },
      { name: "آبیک" },
      { name: "بوئین‌زهرا" },
      { name: "البرز" },
      { name: "آوج" }
    ]
  },
  {
    name: "قم",
    cities: [
      { name: "قم" }
    ]
  },
  {
    name: "کردستان",
    cities: [
      { name: "سنندج" },
      { name: "سقز" },
      { name: "مریوان" },
      { name: "بانه" },
      { name: "قروه" },
      { name: "بیجار" },
      { name: "کامیاران" },
      { name: "دیواندره" },
      { name: "دهگلان" },
      { name: "سروآباد" }
    ]
  },
  {
    name: "کرمان",
    cities: [
      { name: "کرمان" },
      { name: "رفسنجان" },
      { name: "سیرجان" },
      { name: "جیرفت" },
      { name: "بم" },
      { name: "زرند" },
      { name: "کهنوج" },
      { name: "بردسیر" },
      { name: "رابر" },
      { name: "شهربابک" },
      { name: "بافت" },
      { name: "انار" },
      { name: "عنبرآباد" },
      { name: "منوجان" },
      { name: "قلعه‌گنج" },
      { name: "رودبار جنوب" },
      { name: "فهرج" },
      { name: "ریگان" },
      { name: "نرماشیر" },
      { name: "فاریاب" },
      { name: "ارزوئیه" }
    ]
  },
  {
    name: "کرمانشاه",
    cities: [
      { name: "کرمانشاه" },
      { name: "اسلام‌آباد غرب" },
      { name: "پاوه" },
      { name: "سنقر" },
      { name: "کنگاور" },
      { name: "سرپل ذهاب" },
      { name: "جوانرود" },
      { name: "هرسین" },
      { name: "گیلان غرب" },
      { name: "صحنه" },
      { name: "دالاهو" },
      { name: "قصر شیرین" },
      { name: "روانسر" },
      { name: "ثلاث باباجانی" }
    ]
  },
  {
    name: "کهگیلویه و بویراحمد",
    cities: [
      { name: "یاسوج" },
      { name: "گچساران" },
      { name: "دهدشت" },
      { name: "دوگنبدان" },
      { name: "سی‌سخت" },
      { name: "لیکک" },
      { name: "باشت" },
      { name: "چرام" },
      { name: "لنده" }
    ]
  },
  {
    name: "گلستان",
    cities: [
      { name: "گرگان" },
      { name: "گنبد کاووس" },
      { name: "علی‌آباد کتول" },
      { name: "آق‌قلا" },
      { name: "کردکوی" },
      { name: "بندر گز" },
      { name: "آزادشهر" },
      { name: "مینودشت" },
      { name: "رامیان" },
      { name: "کلاله" },
      { name: "ترکمن" },
      { name: "گالیکش" },
      { name: "مراوه‌تپه" },
      { name: "گمیشان" }
    ]
  },
  {
    name: "گیلان",
    cities: [
      { name: "رشت" },
      { name: "انزلی" },
      { name: "لاهیجان" },
      { name: "لنگرود" },
      { name: "آستارا" },
      { name: "تالش" },
      { name: "رودسر" },
      { name: "صومعه‌سرا" },
      { name: "فومن" },
      { name: "شفت" },
      { name: "آستانه اشرفیه" },
      { name: "رودبار" },
      { name: "سیاهکل" },
      { name: "ماسال" },
      { name: "رضوانشهر" },
      { name: "املش" }
    ]
  },
  {
    name: "لرستان",
    cities: [
      { name: "خرم‌آباد" },
      { name: "بروجرد" },
      { name: "دورود" },
      { name: "الیگودرز" },
      { name: "ازنا" },
      { name: "کوهدشت" },
      { name: "نورآباد" },
      { name: "پلدختر" },
      { name: "سلسله" },
      { name: "رومشکان" },
      { name: "چگنی" }
    ]
  },
  {
    name: "مازندران",
    cities: [
      { name: "ساری" },
      { name: "بابل" },
      { name: "آمل" },
      { name: "قائم‌شهر" },
      { name: "بهشهر" },
      { name: "تنکابن" },
      { name: "چالوس" },
      { name: "نوشهر" },
      { name: "رامسر" },
      { name: "نکا" },
      { name: "بابلسر" },
      { name: "فریدونکنار" },
      { name: "جویبار" },
      { name: "محمودآباد" },
      { name: "نور" },
      { name: "سوادکوه" },
      { name: "گلوگاه" },
      { name: "میاندورود" },
      { name: "عباس‌آباد" },
      { name: "کلاردشت" },
      { name: "سیمرغ" }
    ]
  },
  {
    name: "مرکزی",
    cities: [
      { name: "اراک" },
      { name: "ساوه" },
      { name: "خمین" },
      { name: "محلات" },
      { name: "دلیجان" },
      { name: "شازند" },
      { name: "تفرش" },
      { name: "آشتیان" },
      { name: "کمیجان" },
      { name: "زرندیه" },
      { name: "فراهان" },
      { name: "خنداب" }
    ]
  },
  {
    name: "هرمزگان",
    cities: [
      { name: "بندرعباس" },
      { name: "میناب" },
      { name: "بندر لنگه" },
      { name: "قشم" },
      { name: "رودان" },
      { name: "حاجی‌آباد" },
      { name: "بستک" },
      { name: "جاسک" },
      { name: "پارسیان" },
      { name: "سیریک" },
      { name: "بشاگرد" },
      { name: "خمیر" },
      { name: "ابوموسی" }
    ]
  },
  {
    name: "همدان",
    cities: [
      { name: "همدان" },
      { name: "ملایر" },
      { name: "نهاوند" },
      { name: "تویسرکان" },
      { name: "اسدآباد" },
      { name: "کبودرآهنگ" },
      { name: "رزن" },
      { name: "بهار" },
      { name: "فامنین" }
    ]
  },
  {
    name: "یزد",
    cities: [
      { name: "یزد" },
      { name: "میبد" },
      { name: "اردکان" },
      { name: "تفت" },
      { name: "مهریز" },
      { name: "ابرکوه" },
      { name: "اشکذر" },
      { name: "بهاباد" },
      { name: "خاتم" },
      { name: "بافق" }
    ]
  }
];

// Get all cities for a given province
export const getCitiesForProvince = (provinceName: string): City[] => {
  const province = iranProvinces.find(p => p.name === provinceName);
  return province ? province.cities : [];
};

// Check if selected city is Mashhad
export const isMashhad = (cityName: string): boolean => {
  return cityName === "مشهد";
};
