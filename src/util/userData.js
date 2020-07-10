const { firestore: db } = require('./db');
const moment = require('moment');

exports.userData = async user => {
	const { name, timetable } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		announcements: [],
		study: [],
		name,
		user,
		timetable
	};

	data.announcements = await db.collection('data').doc('announcements').get()
		.then(snap => snap.data()[user]) ?? [];
	return data;
};

exports.assignments = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data().data);
	console.log(name);
	const data = {
		name,
		assignments: [],
		user
	};
	const rawAssignments = await db.collection('data').doc('assignments').get()
		.then(snap => snap.data()?.[user]);
	data.assignments = rawAssignments.map(a => {
		const due = moment((a.due?._seconds * 1000) + 1.98e+7).format('Do MMM, dddd');
		const date = moment((a.date?._seconds * 1000) + 1.98e+7).format('Do MMM, dddd');
		return { ...a, due, date };
	}).reverse();

	return data;
};

exports.notes = async user => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		name,
		notes: [],
		user
	};

	const rawNotes = await db.collection('data').doc('notes').get()
		.then(snap => snap.data()?.[user]);
	data.notes = rawNotes.map(n => {
		const date = moment((n.date?._seconds * 1000) + 1.98e+7).format('Do MMM, dddd');
		return { ...n, date };
	}).reverse();

	return data;
};

exports.attendance = async (user, m) => {
	const { name } = await db.collection('users').doc(user).get()
		.then(snap => snap.data()?.data);
	const data = {
		list: [],
		present: 0,
		absent: 0,
		holidays: 0,
		month: undefined,
		days: 0,
		name,
		user
	};

	const rawAttendance = await db.collection('data').doc('attendance').get()
		.then(snap => snap.data()?.[user]);
	let month = undefined;
	if (m) month = moment(new Date().setMonth(m)).format('MMM').toLowerCase();
	else month = moment().format('MMM').toLowerCase();
	const list = rawAttendance[month];
	data.present = list?.filter(a => a === 'p')?.length;
	data.absent = list?.filter(a => a === 'a')?.length;
	data.holiday = list?.filter(a => a === 'h')?.length;
	data.list = list;
	data.month = moment(month, 'MMM').format('MMMM YYYY');
	data.days = new Array(moment(month, 'MMM').daysInMonth());

	return data;
};

exports.marks = async user => {
	const data = {
		link: undefined
	};
	data.link = await db.collection('data').doc('marks').get()
		.then(snap => snap.data()[user]);
	return data;
};

exports.syllabus = async user => {
	const data = {
		link: undefined
	};
	data.link = await db.collection('data').doc('syllabus').get()
		.then(snap => snap.data()[user]?.link);
	return data;
};
