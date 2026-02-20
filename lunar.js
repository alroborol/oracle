// Pure-JS lunar conversion (1900-2100) using a precomputed lunarInfo table.
// Exposes `window.solar2lunar(year, month, day)` returning:
// { lYear, lMonth, lDay, isLeap }
// Implementation based on standard lunarInfo tables used for Chinese lunar calendar.
(function(){
  // lunarInfo for 1900..2100 (inclusive start 1900 to 2099)
  const lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
    0x0d520
  ];

  function leapMonth(y){
    return lunarInfo[y-1900] & 0xf;
  }
  function monthDays(y,m){
    // m: 1..12
    const info = lunarInfo[y-1900];
    // shift: months bits start at 16
    const bit = 0x8000 >> (m-1);
    return (info & bit) ? 30 : 29;
  }
  function leapMonthDays(y){
    const lm = leapMonth(y);
    if (lm) return (lunarInfo[y-1900] & 0x10000) ? 30 : 29;
    return 0;
  }
  function yearDays(y){
    let sum = 348; // 29*12
    const info = lunarInfo[y-1900];
    for(let i=0x8000;i>0;i>>=1){ if (info & i) sum += 1; }
    return sum + leapMonthDays(y);
  }

  const baseDate = Date.UTC(1900,0,31); // 1900-01-31 Gregorian == lunar 1900-01-01

  function solar2lunar(y, m, d){
    // validate range
    if (y < 1900 || y > 2099) {
      // fallback to approximate
      const LICHUN_MONTH = 2, LICHUN_DAY = 4;
      const lunarYear = (m < LICHUN_MONTH || (m === LICHUN_MONTH && d < LICHUN_DAY)) ? y - 1 : y;
      return { lYear: lunarYear, lMonth: m, lDay: d, isLeap: false };
    }
    const objDate = Date.UTC(y, m-1, d);
    let offset = Math.floor((objDate - baseDate) / 86400000);
    let iYear = 1900;
    let daysOfYear = yearDays(iYear);
    while(offset >= daysOfYear){ offset -= daysOfYear; iYear++; daysOfYear = yearDays(iYear); }
    let lYear = iYear;
    const leap = leapMonth(lYear);
    let isLeap = false;
    let iMonth = 1;
    let mdays = 0;
    for(;;){
      if (iMonth === (leap+1) && leap>0 && !isLeap){
        mdays = leapMonthDays(lYear);
        isLeap = true;
      } else {
        mdays = monthDays(lYear, iMonth);
        if (isLeap && iMonth === (leap+1)){
          // after leap month processed, move to next real month
          isLeap = false;
        }
      }
      if (offset < mdays) break;
      offset -= mdays;
      if (!isLeap) iMonth++;
    }
    const lMonth = iMonth;
    const lDay = offset + 1;
    return { lYear: lYear, lMonth: lMonth, lDay: lDay, isLeap: isLeap };
  }

  window.solar2lunar = solar2lunar;
})();
