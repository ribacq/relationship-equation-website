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

let testData = {
	h: {
		base: 10,
		inertia: 0.8,
		threshNeg: -2,
		threshPos: 4
	},
	w: {
		base: 16,
		inertia: -0.4,
		threshNeg: -3,
		threshPos: 1
	}
};

drawGraphs(spiralingData, 10, 10);

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
	let hMood = [hStart];
	let wMood = [wStart];
	let times = [0];
	for (let i = 0; i < lim; i++) {
		let hNext = data.h.base + data.h.inertia * hMood[i] + influence(wMood[i], data.w);
		let wNext = data.w.base + data.w.inertia * wMood[i] + influence(hMood[i], data.h);
		hMood.push(hNext);
		wMood.push(wNext);
		times.push(i + 1);
	}
	return [hMood, wMood, times];
}

function drawGraphs(coupleData, hStart, wStart) {
	//data retrieval part
	let lim = 400;
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
	if (xMin > 0) { xMin *= -0.10; xMax *= 1.10; }
	if (xMax < 0) { xMax *= -0.10; xMin *= 0.90; }
	if (yMin > 0) { yMin *= -0.10; yMax *= 1.10; }
	if (yMax < 0) { yMax *= -0.10; yMin *= 0.90; }
	document.getElementById("sidep").innerHTML +=
		xMin + " < x < " + xMax + "<br/>" +
		yMin + " < y < " + yMax + "<br/>";
	
	//adapt data to canvas size
	dispX = x.map(curX => {
		return (canvas.width / (xMax - xMin)) * (curX - xMin);
	});
	dispY = y.map(curY => {
		return canvas.height - (canvas.height / (yMax - yMin)) * (curY - yMin);
	});

	//draw axis
	ctx.strokeStyle = '#e85656';
	//x-axis
	ctx.moveTo(0, canvas.height - (canvas.height / (yMax - yMin)) * (-yMin));
	ctx.lineTo(canvas.width, canvas.height - (canvas.height / (yMax - yMin)) * (-yMin));
	ctx.stroke();
	//y-axis
	ctx.moveTo((canvas.width / (xMax - xMin)) * (-xMin), 0);
	ctx.lineTo((canvas.width / (xMax - xMin)) * (-xMin), canvas.height);
	ctx.stroke();
	//axis labels
	ctx.font = "10px Arial";
	ctx.fillText(0, 0, canvas.height);
	ctx.fillText(xMax, canvas.width - 20, canvas.height);
	ctx.fillText(yMax, 0, 20);

	//draw graph
	ctx.strokeStyle = '#088';
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

