import type { Moment } from "moment";

declare module "moment" {
  interface Moment {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDay(): number;
    jDaysInMonth(): number;
    jalali(y: number, m: number, d: number): Moment;
  }
}

declare module "moment-jalaali" {
  import moment = require("moment");
  export = moment;
}
