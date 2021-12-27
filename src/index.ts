const canvasBase = document.querySelector("canvas")!;
const canvasCtx = canvasBase.getContext("2d")!;

const EARTH_MASS = 5.9722 * 10 ** 24; // kg
const BALL_MASS = 100; // kg
const EARTH_RADIUS = 6371000; // m
const MOUNTAIN_HEIGHT = 2730000; // m
const SCALE = 1 / 60000; // px/m
const TIME_STEP = 40;

const initialCannonBallVelocity = 6.14 * 10 ** 3; // m/s
const imgScale = 1;
function getCenter(): number[] {
	return [canvasCtx.canvas.width / 2/imgScale, canvasCtx.canvas.height / 2/imgScale];
}

function setCanvasSize(): void {
	canvasCtx.canvas.width = canvasCtx.canvas.clientWidth * imgScale;
	canvasCtx.canvas.height = canvasCtx.canvas.clientHeight * imgScale;
	canvasCtx.scale(imgScale, imgScale);
}

function calculateDistance(
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function calculateGravitationalForce(
	body1Mass: number,
	body2Mass: number,
	distance: number
): number {
	const gravConstant = 6.674184 * 10 ** -11; // Nm²/kg² or  m³/(s²kg)
	return gravConstant * (1 / distance ** 2) * body1Mass * body2Mass;
}

class CannonBall {
	private _x: number = 0;
	private _y: number = 0;

	public get x(): number {
		const [xC, _] = getCenter();
		return xC + this._x;
	}

	public get y(): number {
		const [_, yC] = getCenter();
		return yC - EARTH_RADIUS * SCALE - MOUNTAIN_HEIGHT * SCALE + this._y;
	}

	private radius: number = 10;
	private color: string = "red";
	private vx: number = initialCannonBallVelocity * SCALE; // m/s * (px/m) = px/s;
	private vy: number = 0;

	private motion(): void {
		const [xCenter, yCenter] = getCenter();
		const earthDistance =
			calculateDistance(xCenter, yCenter, this.x, this.y) * (1 / SCALE); // px * (m/px) = m
		const force = calculateGravitationalForce(
			EARTH_MASS,
			BALL_MASS,
			earthDistance
		); // N
		const dx = (xCenter - this.x) * (1 / SCALE); // px * (m/px) = m
		const dy = (yCenter - this.y) * (1 / SCALE); // px * (m/px) = m

		const Fx = force * (dx / earthDistance);
		const Fy = force * (dy / earthDistance);

		const ax = (Fx / BALL_MASS) * SCALE; // m/s² * (px/m) = px/s²
		const ay = (Fy / BALL_MASS) * SCALE; // m/s² * (px/m) = px/s²

		const shouldKeepMoving = earthDistance >= EARTH_RADIUS + 8 / SCALE;

		if (shouldKeepMoving) {
			this.vx += ax * TIME_STEP;
			this.vy += ay * TIME_STEP;

			this._x += this.vx * TIME_STEP;
			this._y += this.vy * TIME_STEP;
		}
	}

	public draw(): void {
		this.motion();
		canvasCtx.beginPath();
		canvasCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		canvasCtx.fillStyle = this.color;
		canvasCtx.fill();
	}
}

class Earth {
	private _x: number = 0;
	private _y: number = 0;

	public get x(): number {
		const [xC, _] = getCenter();
		return this._x + xC;
	}

	public get y(): number {
		const [_, yC] = getCenter();
		return this._y + yC;
	}

	private radius: number = EARTH_RADIUS * SCALE;
	private color: string = "blue";

	public draw(): void {
		canvasCtx.beginPath();
		canvasCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		canvasCtx.fillStyle = this.color;
		canvasCtx.fill();
	}
}

function drawBall(x: number, y: number) {
	canvasCtx.beginPath();
	canvasCtx.arc(x, y, 5, 0, Math.PI * 2);
	canvasCtx.fillStyle = "green";
	canvasCtx.fill();
}

const earthImg = document.createElement("img");

earthImg.src = "../public/assets/earth.svg ";
earthImg.style.scale = "5;";
earthImg.onload = function () {
	animate();
	console.log(earthImg.width, earthImg.height);
};

const cannonBall = new CannonBall();
const earth = new Earth();

function animate(): void {
	requestAnimationFrame(animate);

	setCanvasSize();
	const [xC, yC] = getCenter();

	canvasCtx.drawImage(
		earthImg,
		xC - EARTH_RADIUS * SCALE,
		yC - EARTH_RADIUS * SCALE,
		2 * EARTH_RADIUS * SCALE,
		2 * EARTH_RADIUS * SCALE
	);
	// canvasCtx.drawImage(earthImg,0,0,1024 ,1024  )
	

	drawBall(
		canvasCtx.canvas.width / 2 / imgScale,
		canvasCtx.canvas.height / 2 / imgScale -
			EARTH_RADIUS * SCALE -
			MOUNTAIN_HEIGHT * SCALE -
			10 * SCALE
	);
	drawBall(
		canvasCtx.canvas.width / 2 / imgScale,
		canvasCtx.canvas.height / 2 / imgScale +
			EARTH_RADIUS * SCALE +
			MOUNTAIN_HEIGHT * SCALE +
			10 * SCALE
	);

	// earth.draw();
	cannonBall.draw();
}
