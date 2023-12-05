class Car {
    constructor(id) {
        this.id = id;
        this.driftFactor = .5;
        this.p = [(canvas.width / 2) + (randInt(LANE_WIDTH) * 4) - (LANE_WIDTH * 2), canvas.height / 2];
        this.v = 0;
        this.angle = 0;
        this.colour = `rgb(${randInt(220)}, ${randInt(220)}, ${randInt(220)})`;
        this.network = newNetwork([4, 20, 9]);
        console.log(this.network);
        // this.loadFetchedNetwork('./savedNetworks/Network4-1.json');
        this.learningRate = .01;
        this.trainingSet = [];

        // this.loadFetchedNetwork('./savedNetworks/firstNetwork.json');
    }

    get state() {
        const distToRightLane = normalise(Math.abs(this.p[0] - ((canvas.width / 2) - LANE_WIDTH)), LANE_WIDTH * 2, 0);
        const distToLeftLane = normalise(Math.abs(this.p[0] - ((canvas.width / 2) + LANE_WIDTH)), LANE_WIDTH * 2, 0);
        const speed = normalise(this.v, MAX_BACKWARD_SPEED, MAX_FORWARD_SPEED);
        const angle = normalise(this.angle, -360, 360);
        return [distToLeftLane, distToRightLane, speed, angle];
    }

    loadFetchedNetwork(filePath) {
        fetch(filePath).then((response) => response.json()).then((json) => this.network = Network.fromJSON(json));
    }

    reset() {
        this.p = [(canvas.width / 2) + (randInt(LANE_WIDTH) * 4) - (LANE_WIDTH * 2), canvas.height / 2];
        this.v = 0;
        this.angle = 0;
        this.trainingSet = [];
    }

    useValueNetwork(dt) {
        // Main network function
        const oldState = this.state;
        let oldStateQValues = this.network.activate(oldState);
        const currentAction = this.getNextAction(oldStateQValues);
        this.takeAction(dt, currentAction.acceleration, currentAction.turnDirection);
        const newState = this.state;
        const newStateQValues = this.network.activate(newState);
        const nextAction = this.getNextAction(newStateQValues, true);
        const reward = this.calcReward(newState);
        const discountFactor = 1;
        oldStateQValues[currentAction.index] = reward + discountFactor * nextAction.value;
        this.trainingSet.push({
            input: oldState,
            output: oldStateQValues
        })
    }

    trainNetwork() {
        let trainer = new Trainer(this.network);
        trainer.train(this.trainingSet, {
            rate: .000001,
            iterations: 10,
            error: .005,
            shuffle: true,
            cost: Trainer.cost.MSE,
            schedule: {
                every: 100,
                do: function(data) {
                    console.log("Error", data.error, "Iterations", data.iterations, "Rate", data.rate);
                }
            }
        });
        console.log(this.network);
        localStorage.setItem('tempNetwork', this.network);
    }

    calcReward(currentState) {
        let reward = 0;
        // Distance from center
        reward += 1 - Math.abs(currentState[0] - currentState[1]);
        // Speed
        if (currentState[2] > .75) {
            reward += .5;
        } else if (currentState[2] > .5) {
            reward += .2;
        }
        // Outside of Road
        let rects = [ agent.createRect() ];
        obstacleCars.forEach(car => {
            rects.push(car.createRect());
        })
        if (!isRectCollide(rects[0], { x: canvas.width / 2, y: 0, w: LANE_WIDTH - CAR_WIDTH / 2, h: ROAD_LENGTH, angle: 0, colour: 'grey' })) {
            reward -= 2;
        }
        return reward;
    }

    getNextAction(outputQValues, getBestAction = false) {
        // console.log(outputQValues);
        let nextAction = {
            index: null,
            value: null,
            acceleration: null,
            turnDirection: null
        };

        // Find Highest QValue
        let maxOutputQValue = [null, -Infinity] // index, value
        for (let i = 0; i < outputQValues.length; i++) {
            if (outputQValues[i] > maxOutputQValue[1]) {
                maxOutputQValue = [i, outputQValues[i]];
            }
        }

        // Pick Next Action
        let actionPicked = [null, null];
        if (Math.random() > this.learningRate || getBestAction) {
            actionPicked = maxOutputQValue;
        } else {
            // let otherActions = [0, 1, 2, 3, 4, 5, 6, 7, 8].splice(maxOutputQValue[0], 1);
            // actionPicked = otherActions[randInt(otherActions.length - 1)];
            actionPicked[1] = outputQValues[randInt(outputQValues.length - 1)];
            actionPicked[0] = outputQValues.indexOf(actionPicked[1]);
        }

        nextAction.index = actionPicked[0];
        nextAction.value = actionPicked[1];
        switch(actionPicked[0]) {
            case 0:
                nextAction.acceleration = 1;
                nextAction.turnDirection = -1;
                break;
            case 1:
                nextAction.acceleration = 1;
                nextAction.turnDirection = 0;
                break;
            case 2:
                nextAction.acceleration = 1;
                nextAction.turnDirection = 1;
                break;
            case 3:
                nextAction.acceleration = 0;
                nextAction.turnDirection = -1;
                break;
            case 4:
                nextAction.acceleration = 0;
                nextAction.turnDirection = 0;
                break;
            case 5:
                nextAction.acceleration = 0;
                nextAction.turnDirection = 1;
                break;
            case 6:
                nextAction.acceleration = -1;
                nextAction.turnDirection = -1;
                break;
            case 7:
                nextAction.acceleration = -1;
                nextAction.turnDirection = 0;
                break;
            case 8:
                nextAction.acceleration = -1;
                nextAction.turnDirection = 1;
                break;
        }

        return nextAction;
    }

    takeAction(dt, acceleration, turnDirection) {
        const accelerationFactor = .2;

        this.v += acceleration * accelerationFactor * dt;
        if (this.v > MAX_FORWARD_SPEED) {
            this.v = MAX_FORWARD_SPEED;
        } else if (this.v < MAX_BACKWARD_SPEED) {
            this.v = MAX_BACKWARD_SPEED;
        }

        this.angle += turnDirection * ((-1 / 7) * Math.abs(this.v) + 3) * (this.v / 3) * dt;
        if (this.angle >= 360) {
            this.angle -= 360;
        } else if (this.angle <= -360) {
            this.angle += 360;
        }

        this.p[0] += this.v * Math.sin(this.angle * Math.PI / 180) * dt;
        this.p[1] -= this.v * Math.cos(this.angle * Math.PI / 180) * dt;
    }

    focusedRender() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(carAsset, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
        ctx.restore();
    }

    fixedRender(translation) {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.p[0] - translation[0] + canvas.width / 2, this.p[1] - translation[1] + canvas.height / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.drawImage(carAsset, -CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
        ctx.restore();
    }

    createRect() {
        return { x: this.p[0], y: this.p[1], w: CAR_WIDTH, h: CAR_HEIGHT, angle: this.angle, colour: this.colour };
    }

    getAxis() {
        const OX = new Vector({ x: 1, y: 0 });
        const OY = new Vector({ x: 0, y: 1 });
        const RX = OX.Rotate(this.theta);
        const RY = OY.Rotate(this.theta);
        return [
            new Line({ ...this.center, dx: RX.x, dy: RX.y }),
            new Line({ ...this.center, dx: RY.x, dy: RY.y }),
        ];
    }

    getCorners() {
        const axis = this.getAxis();
        const RX = axis[0].direction.Multiply(this.size.x / 2);
        const RY = axis[1].direction.Multiply(this.size.y / 2);
        return [
            this.center.Add(RX).Add(RY),
            this.center.Add(RX).Add(RY.Multiply(-1)),
            this.center.Add(RX.Multiply(-1)).Add(RY.Multiply(-1)),
            this.center.Add(RX.Multiply(-1)).Add(RY),
        ]
    }
}