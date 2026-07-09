const SCHEDULE = {
	0: { open: 9 * 60, close: 19 * 60 },
	1: { open: 8 * 60, close: 20 * 60 },
	2: { open: 8 * 60, close: 20 * 60 },
	3: { open: 8 * 60, close: 20 * 60 },
	4: { open: 8 * 60, close: 20 * 60 },
	5: { open: 8 * 60, close: 21 * 60 },
	6: { open: 8 * 60, close: 21 * 60 },
};
const DAY_SHORT = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];

function pad(n) {
	return String(n).padStart(2, "0");
}
function fmt(mins) {
	const h = Math.floor(mins / 60) % 24;
	const m = mins % 60;
	return `${pad(h)}:${pad(m)}`;
}

function computeStatus(now) {
	const day = now.getDay();
	const mins = now.getHours() * 60 + now.getMinutes();
	const today = SCHEDULE[day];
	const isOpen = mins >= today.open && mins < today.close;

	let text;
	if (isOpen) {
		text = `Відкрито · Зачиняється сьогодні о ${fmt(today.close)}`;
	} else if (mins < today.open) {
		text = `Зачинено · Відчиняється сьогодні о ${fmt(today.open)}`;
	} else {
		const nextDay = (day + 1) % 7;
		text = `Зачинено · Відчиняється ${DAY_SHORT[nextDay]}, ${fmt(SCHEDULE[nextDay].open)}`;
	}
	return { isOpen, text, day };
}

function renderStatus() {
	const { isOpen, text, day } = computeStatus(new Date());

	document.getElementById("status-text").textContent = text;
	document.getElementById("status-text-2").textContent = text;
	const t3 = document.getElementById("status-text-3");
	if (t3) t3.textContent = text;

	document.getElementById("status-dot").classList.toggle("is-open", isOpen);
	document.getElementById("status-dot-2").classList.toggle("is-open", isOpen);
	if (isOpen) {
		document.getElementById("status-dot-2").style.background = "#7c8f47";
	} else {
		document.getElementById("status-dot-2").style.background = "#8a5a1f";
	}

	document.querySelectorAll(".hours-row").forEach((row) => {
		const rowDay = Number(row.getAttribute("data-day"));
		row.classList.toggle("today", rowDay === day);
	});
}

renderStatus();

setInterval(renderStatus, 60 * 1000);

const PEAK_DATA = {
	1: [0, 20, 45, 55, 60, 75, 55, 40, 15, 12, 25, 55, 70, 60, 50, 35],
	2: [0, 25, 35, 30, 45, 48, 45, 35, 38, 48, 52, 65, 70, 72, 68, 55],
	3: [0, 35, 55, 58, 58, 60, 62, 75, 60, 48, 45, 48, 58, 52, 45, 32],
	4: [0, 30, 42, 45, 48, 52, 58, 65, 75, 70, 60, 55, 52, 48, 42, 32],
	5: [0, 30, 45, 40, 55, 60, 45, 38, 42, 70, 75, 78, 80, 78, 70, 65],
	6: [0, 35, 50, 55, 60, 75, 85, 95, 80, 65, 55, 52, 50, 48, 45, 35],
	0: [0, 30, 45, 50, 35, 40, 45, 65, 70, 68, 70, 68, 65, 55, 45, 35],
};
const PEAK_HOURS = Array.from({ length: 16 }, (_, i) => 6 + i);
const AXIS_HOURS = [6, 9, 12, 15, 18, 21];
const DAY_NAMES = {
	0: "неділю",
	1: "понеділок",
	2: "вівторок",
	3: "середу",
	4: "четвер",
	5: "п'ятницю",
	6: "суботу",
};

const peakChartEl = document.getElementById("peak-chart");
const peakAxisEl = document.getElementById("peak-axis");
const peakDayLabel = document.getElementById("peak-day-label");
const dayTabs = document.querySelectorAll("#day-tabs button");

function renderPeakChart(day) {
	const data = PEAK_DATA[day];
	const max = Math.max(...data);
	const now = new Date();
	const isToday = now.getDay() === day;
	const currentHour = now.getHours();

	peakChartEl.innerHTML = data
		.map((v, i) => {
			const hour = PEAK_HOURS[i];
			const height = Math.max(3, Math.round((v / max) * 100));
			const isNow = isToday && hour === currentHour;
			return `<div class="peak-col"><div class="peak-bar${isNow ? " is-now" : ""}" style="height:${height}%"></div></div>`;
		})
		.join("");

	peakAxisEl.innerHTML = PEAK_HOURS.map((h) =>
		AXIS_HOURS.includes(h) ? `<span>${h}</span>` : `<span></span>`,
	).join("");

	peakDayLabel.textContent = isToday
		? `сьогодні (${DAY_NAMES[day]})`
		: DAY_NAMES[day];

	dayTabs.forEach((btn) => {
		btn.classList.toggle("active", Number(btn.dataset.day) === day);
	});
}

dayTabs.forEach((btn) => {
	btn.addEventListener("click", () => renderPeakChart(Number(btn.dataset.day)));
});

renderPeakChart(new Date().getDay());

setInterval(() => {
	const activeBtn = document.querySelector("#day-tabs button.active");
	if (activeBtn) renderPeakChart(Number(activeBtn.dataset.day));
}, 60 * 1000);

const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
	nav.classList.toggle("scrolled", window.scrollY > 40);
});

const revealEls = document.querySelectorAll(
	".section-head, .about-grid, .menu-grid, .gallery-grid, .rev-layout, .hl-grid",
);
revealEls.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("in");
				io.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.12 },
);
revealEls.forEach((el) => io.observe(el));
