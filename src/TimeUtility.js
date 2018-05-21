import { DateTime } from 'luxon'

export class Day {
  static previousDay(day) {
    return DateTime.fromISO(day).plus({ days: -1 }).toISODate();
  }
  static nextDay(day) {
    return DateTime.fromISO(day).plus({ days: 1 }).toISODate();
  }
  static today() {
    return DateTime.local().toISODate();
  }
}

export class Time {
  static from(h, m) {
    if (arguments.length === 1) { 
      return {h: h.hour, m: h.minute};
    } else {
      return {h: h, m: m};
    }
    
  }
  static now() {
    return Time.from(DateTime.local().setZone('Europe/Paris'));
  }
  static dateFromTime(t) {
    var d = new Date();
    d.setHours(t.h);
    d.setMinutes(t.m);
    return d;
  }
}
