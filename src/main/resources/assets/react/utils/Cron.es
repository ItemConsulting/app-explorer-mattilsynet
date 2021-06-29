/*

┌────────── minute (0 - 59)
│ ┌──────── hour (0 - 23)
│ │ ┌────── day of month (1 - 31)
│ │ │ ┌──── month (1 - 12)
│ │ │ │ ┌── day of week (0 - 6 => Sunday - Saturday, or
│ │ │ │ │                1 - 7 => Monday - Sunday)
↓ ↓ ↓ ↓ ↓
* * * * * command to be executed

Commas are used to separate items of a list. For example, using "MON,WED,FRI"
in the 5th field (day of week) means Mondays, Wednesdays and Fridays.

Dash defines ranges. For example, 2000–2010 indicates every year between
2000 and 2010, inclusive.

'L' stands for "last". When used in the day-of-week field, it allows specifying
constructs such as "the last Friday" ("5L") of a given month. In the
day-of-month field, it specifies the last day of the month.

The 'W' character is allowed for the day-of-month field. This character is used
to specify the weekday (Monday-Friday) nearest the given day. As an example, if
"15W" is specified as the value for the day-of-month field, the meaning is:
"the nearest weekday to the 15th of the month." So, if the 15th is a Saturday,
the trigger fires on Friday the 14th. If the 15th is a Sunday, the trigger fires
on Monday the 16th. If the 15th is a Tuesday, then it fires on Tuesday the 15th.
However, if "1W" is specified as the value for day-of-month, and the 1st is a
Saturday, the trigger fires on Monday the 3rd, as it does not 'jump' over the
boundary of a month's days. The 'W' character can be specified only when the
day-of-month is a single day, not a range or list of days.

'#' is allowed for the day-of-week field, and must be followed by a number
between one and five. It allows specifying constructs such as
"the second Friday" of a given month.[19] For example, entering "5#3" in the
day-of-week field corresponds to the third Friday of every month.

In some implementations, used instead of '*' for leaving either day-of-month or
day-of-week blank. Other cron implementations substitute "?" with the start-up
time of the cron daemon, so that ? ? * * * * would be updated to 25 8 * * * * if
cron started-up on 8:25am, and would run at this time every day until restarted
again.
*/

// In vixie-cron, slashes can be combined with ranges to specify step values.[8]
// For example, */5 in the minutes field indicates every 5 minutes (see note
// below about frequencies). It is shorthand for the more verbose POSIX form
// 5,10,15,20,25,30,35,40,45,50,55,00. POSIX does not define a use for slashes;
// its rationale (commenting on a BSD extension) notes that the definition is
// based on System V format but does not exclude the possibility of extensions.

/*
'H' is used in the Jenkins continuous integration system to indicate that a
"hashed" value is substituted. Thus instead of a fixed number such as
'20 * * * *' which means at 20 minutes after the hour every hour, 'H * * * *'
indicates that the task is performed every hour at an unspecified but invariant
time for each task. This allows spreading out tasks over time, rather than
having all of them start at the same time and compete for resources.
*/

const DAY_OF_WEEK_TO_HUMAN = {
	'*': 'Every day', // 9
	'0': 'Sunday',    // 6
	'1': 'Monday',    // 6
	'2': 'Tuesday',   // 7
	'3': 'Wednesday', // 9
	'4': 'Thursday',  // 8
	'5': 'Friday',    // 6
	'6': 'Saturday',  // 8
	'7': 'Sunday'     // 6
};
const WIDEST_DAY_OF_WEEK = 9;

function rpad(s, w = 2, z = ' ') {
	s = s + '';
	return s.length >= w
		? s
		: s + new Array(w - s.length + 1).join(z);
}

function lpad(s, w = 2, z = ' ') {
	s = s + '';
	return s.length >= w ? s : new Array(w - s.length + 1).join(z) + s;
}

function zeroPad(s, w=2) {
	return lpad(s,w,'0');
}

export class Cron {
	static hourToHuman(hour) {
		if (
			hour === '*' ||
			(
				Array.isArray(hour) &&
				hour.length === 24 // Every hour
			)
		) {
			return '**';
		}
		return Array.isArray(hour) ? hour.map((h) => zeroPad(h)) : zeroPad(hour);
	}

	static minuteToHuman(minute) {
		if (
			minute === '*' ||
			(
				Array.isArray(minute) &&
				minute.length === 60 // Every minute
			)
		) {
			return '**';
		}
		return Array.isArray(minute) ? minute.map((h) => zeroPad(h)) : zeroPad(minute);
	}

	static dayOfWeekToHuman(dayOfWeek, w = WIDEST_DAY_OF_WEEK) {
		//console.debug('w', w, 'dayOfWeek', dayOfWeek);
		if (Array.isArray(dayOfWeek)) {
			if (dayOfWeek.length === 1) {
				return rpad(DAY_OF_WEEK_TO_HUMAN[dayOfWeek[0]], w);
			}
			if (dayOfWeek.length >= 7) { // All days
				return rpad(DAY_OF_WEEK_TO_HUMAN['*'], w);
			}
			return dayOfWeek.map(dow => Cron.dayOfWeekToHuman(dow, 0)).join(', ');
		}
		return rpad(DAY_OF_WEEK_TO_HUMAN[dayOfWeek], w);
	}

	#minute;
	#hour;
	#dayOfMonth;
	#month;
	#dayOfWeek;

	setMinute(minute) { // (0-59) * , -
		this.#minute = minute;
		return this; // Chainable
	}

	setHour(hour) { // (0-23) * , -
		this.#hour = hour;
		return this; // Chainable
	}

	setDayOfMonth(dayOfMonth) { // (1-31) * , - ? L W
		this.#dayOfMonth = dayOfMonth;
		return this; // Chainable
	}

	setMonth(month) { // (1-12) * , -
		this.#month = month;
		return this; // Chainable
	}

	setDayOfWeek(dayOfWeek) { // (0-7) * , - ? L #
		this.#dayOfWeek = dayOfWeek;
		return this; // Chainable
	}

	fromString(string) {
		//console.debug('string', string);
		const fields = string.split(' ');
		//console.debug('fields', fields);
		this.setMinute(fields[0]);
		this.setHour(fields[1]);
		this.setDayOfMonth(fields[2]);
		this.setMonth(fields[3]);
		this.setDayOfWeek(fields[4]);
		return this; // Chainable
	} // fromString

	constructor(string) {
		this.fromString(string);
	} // Chainable by default

	toString() {
		return [
			this.#minute,
			this.#hour,
			this.#dayOfMonth,
			this.#month,
			this.#dayOfWeek
		].join(' ');
	} // toString

	toObj() {
		return {
			minute: this.#minute,
			hour: this.#hour,
			dayOfMonth: this.#dayOfMonth,
			month: this.#month,
			dayOfWeek: this.#dayOfWeek
		};
	} // toObj

	getMinute() {
		return this.#minute;
	}

	getHour() {
		return this.#hour;
	}

	getDayOfMonth() {
		return this.#dayOfMonth;
	}

	getMonth() {
		return this.#month;
	}

	getDayOfWeek() {
		return this.#dayOfWeek;
	}
} // class Cron
