//example data
let happyData = {
	h: {
		base: 0.37,
		inertia: 0.6741,
		threshNeg: -5.94,
		threshPos: 7.94
	},
	w: {
		base: 0.38,
		inertia: 0.6572,
		threshNeg: -5.76,
		threshPos: 9.12
	}
};

let sadData = {
	h: {
		base: 0.41,
		inertia: -0.0177,
		threshNeg: -5.29,
		threshPos: 7.94
	},
	w: {
		base: 0.35,
		inertia: -0.2419,
		threshNeg: -6.76,
		threshPos: 8.53
	}
};

let terribleData = {
	h: {
		base: 0.42,
		inertia: -1.3108,
		threshNeg: -7.71,
		threshPos: 6.65
	},
	w: {
		base: 0.30,
		inertia: 1.323,
		threshNeg: -6.06,
		threshPos: 7.24
	}
};

let spiralingData = {
	h: {
		base: 0.37,
		inertia: -1.6741,
		threshNeg: -5.76,
		threshPos: 9.12
	},
	w: {
		base: 0.38,
		inertia: 0.6572,
		threshNeg: -5.94,
		threshPos: 7.94
	}
};

let testData = {
	h: {
		base: -1,
		inertia: 0.8,
		threshNeg: -2,
		threshPos: 4
	},
	w: {
		base: 1,
		inertia: -0.4,
		threshNeg: -3,
		threshPos: 1
	}
};

drawGraphs(testData, 0, 0);

document.getElementById("updateBtn").onclick = function (e) {
	let hStart = Number(document.getElementById("hStart").value);
	let wStart = Number(document.getElementById("wStart").value);
	drawGraphs(happyData, hStart, wStart);
};

document.getElementById("hStart").onchange = function (e) {
	document.getElementById("hVal").innerText = this.value;
};

document.getElementById("wStart").onchange = function (e) {
	document.getElementById("wVal").innerText = this.value;
};

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

function drawGraphs(coupleData, hStart, wStart) {
	//data retrieval part
	let lim = 100;
	let moods = moodGen(hStart, wStart, coupleData, lim);
	let wMood = moods[0];
	let hMood = moods[1];
	let times = moods[2];

	//display graph
	drawXY(document.getElementById("thGraph"), times, hMood);
	drawXY(document.getElementById("twGraph"), times, wMood);
	drawXY(document.getElementById("hwGraph"), hMood, wMood);
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
	ctx.strokeStyle = '#e85656';
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
	ctx.font = "10px sans-serif";
	ctx.fillText(0, xValToDisp(0) - 8, yValToDisp(0) + 12);
	ctx.fillText(Math.round(xMin), 0, yValToDisp(0) - 2);
	ctx.fillText(Math.round(xMax), canvas.width - 20, yValToDisp(0) - 2);
	ctx.fillText(Math.round(yMin), xValToDisp(0) + 2, canvas.height);
	ctx.fillText(Math.round(yMax), xValToDisp(0) + 2, 10);

	//draw graph
	ctx.strokeStyle = '#088';
	ctx.fillStyle = '#088';
	ctx.beginPath();
	ctx.moveTo(dispX[0], dispY[0]);
	for (let i = 1; i < seqLen; i++) {
		ctx.lineTo(dispX[i], dispY[i]);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(dispX[seqLen - 1], dispY[seqLen - 1], 5, 0, 2 * Math.PI);
	ctx.fill();
}

