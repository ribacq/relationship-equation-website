/* Quentin RIBAC */
let coupleData = {
	h: {
		base: 0.5,
		inertia: 0.6,
		threshNeg: -6,
		threshPos: 8
	},
	w: {
		base: 0.4,
		inertia: 0.7,
		threshNeg: -8,
		threshPos: 9
	}
};
fillForm(coupleData);
updateDisplay();

function fillForm(data) {
	document.getElementById("h").value = data.h.base;
	document.getElementById("rh").value = data.h.inertia;
	document.getElementById("tmh").value = data.h.threshNeg;
	document.getElementById("tph").value = data.h.threshPos;
	document.getElementById("w").value = data.w.base;
	document.getElementById("rw").value = data.w.inertia;
	document.getElementById("tmw").value = data.w.threshNeg;
	document.getElementById("tpw").value = data.w.threshPos;
}

function readForm() {
	return {
		h: {
			base: Number(document.getElementById("h").value),
			inertia: Number(document.getElementById("rh").value),
			threshNeg: Number(document.getElementById("tmh").value),
			threshPos: Number(document.getElementById("tph").value)
		},
		w: {
			base: Number(document.getElementById("w").value),
			inertia: Number(document.getElementById("rw").value),
			threshNeg: Number(document.getElementById("tmw").value),
			threshPos: Number(document.getElementById("tpw").value)
		}
	};
}

function updateDisplay() {
	let hStart = Number(document.getElementById("hStart").value);
	let wStart = Number(document.getElementById("wStart").value);
	document.getElementById("update-status").innerHTML = "<em>Updating…</em>";
	drawGraphs(readForm(), hStart, wStart, function () {
		document.getElementById("update-status").innerHTML = "<strong>Up to date!</strong>";
	});
};

let dataFormInputs = document.getElementById("dataform").children;
for (let i = 0; i < dataFormInputs.length; i++) {
	dataFormInputs.item(i).addEventListener("change", updateDisplay);
}

function drawGraphs(coupleData, hStart, wStart, cb) {
	//data retrieval part
	let lim = 42;
	let moods = moodGen(hStart, wStart, coupleData, lim);
	let hMood = moods[0];
	let wMood = moods[1];
	let times = moods[2];

	//display graph
	drawXY(document.getElementById("thGraph"), times, hMood);
	drawXY(document.getElementById("twGraph"), times, wMood);
	drawXY(document.getElementById("hwGraph"), hMood, wMood);

	cb();
}

//generator function. The Relationship equation is effectively in here
function moodGen(hStart, wStart, data, lim) {
	let influence = function (state, partner) {
		if (state < partner.threshNeg) {
			return partner.threshNeg;
		} else if (state > partner.threshPos) {
			return partner.threshPos;
		} else {
			return 0;
		}
	};
	let getNext = function (hCur, wCur) {
		let hNext = data.h.base + (data.h.inertia - 1) * hCur + influence(wCur, data.w);
		let wNext = data.w.base + (data.w.inertia - 1) * wCur + influence(hCur, data.h);
		return [hNext, wNext];
	};
	let hMood = [hStart];
	let wMood = [wStart];
	let times = [0];
	for (let i = 0; i < lim; i++) {
		//Runge-Kutta method
		let k1 = getNext(hMood[i], wMood[i]);
		let k2 = getNext(hMood[i] + k1[0] / 2, wMood[i] + k1[1] / 2);
		let k3 = getNext(hMood[i] + k2[0] / 2, wMood[i] + k2[1] / 2);
		let k4 = getNext(hMood[i] + k3[0], wMood[i] + k3[1]);
		let hNext = hMood[i] + (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
		let wNext = wMood[i] + (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
		hMood.push(hNext);
		wMood.push(wNext);
		times.push(i + 1);
	}
	return [hMood, wMood, times];
}

function drawXY(canvas, x, y) {
	//get and init. canvas context and style
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//get adapted min and max for x and y
	let seqLen = x.length;
	let xMin = x[0];
	let xMax = x[0];
	let yMin = y[0];
	let yMax = y[0];
	for (let i = 0; i < seqLen; i++) {
		xMin = Math.min(xMin, x[i]);
		xMax = Math.max(xMax, x[i]);
		yMin = Math.min(yMin, y[i]);
		yMax = Math.max(yMax, y[i]);
	}
	if (xMin > 0) { xMin *= -0.10; } else { xMin -= Math.abs(xMax - xMin) / 10; }
	if (xMax < 0) { xMax *= -0.10; } else { xMax += Math.abs(xMax - xMin) / 10; }
	if (yMin > 0) { yMin *= -0.10; } else { yMin -= Math.abs(yMax - yMin) / 10; }
	if (yMax < 0) { yMax *= -0.10; } else { yMax += Math.abs(yMax - yMin) / 10; }
	
	//adapt data to canvas size
	let xValToDisp = function (x) {
		return (canvas.width / (xMax - xMin)) * (x - xMin);
	};
	let yValToDisp = function (y) {
		return canvas.height - (canvas.height / (yMax - yMin)) * (y - yMin);
	};
	let dispX = x.map(xValToDisp);
	let dispY = y.map(yValToDisp);

	//draw axis
	ctx.strokeStyle = '#d9434f';
	//x-axis
	ctx.beginPath();
	ctx.moveTo(0, yValToDisp(0));
	ctx.lineTo(canvas.width, yValToDisp(0));
	ctx.stroke();
	//y-axis
	ctx.beginPath();
	ctx.moveTo(xValToDisp(0), 0);
	ctx.lineTo(xValToDisp(0), canvas.height);
	ctx.stroke();
	//axis labels
	ctx.font = "12px sans-serif";
	ctx.fillText(0, xValToDisp(0) - 8, yValToDisp(0) + 12);
	ctx.fillText(Math.round(xMin), 0, yValToDisp(0) - 2);
	ctx.fillText(Math.round(xMax), canvas.width - 20, yValToDisp(0) - 2);
	ctx.fillText(Math.round(yMin), xValToDisp(0) + 2, canvas.height);
	ctx.fillText(Math.round(yMax), xValToDisp(0) + 2, 10);

	//draw graph
	ctx.fillStyle = '#08c';
	for (let i = 0; i < seqLen - 1; i++) {
		ctx.beginPath();
		ctx.moveTo(dispX[i - 1], dispY[i - 1]);
		ctx.lineTo(dispX[i], dispY[i]);
		ctx.arc(dispX[i], dispY[i], 2, 0, 2*Math.PI);
		ctx.fill();
	}
	ctx.beginPath();
	ctx.arc(dispX[seqLen - 1], dispY[seqLen - 1], 5, 0, 2 * Math.PI);
	ctx.fill();
}

