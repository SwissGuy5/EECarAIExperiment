// let synaptic = require('synaptic');
let Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

// const learningRate = .3;

// Custom Activation Functions
let activationFunction = function TANH (x, derivate) {
    if (derivate) {
        return 1 - Math.pow(Math.tanh(x), 2);
    }
    return Math.tanh(x);
};

// Layer Declaration
function newNetwork(layersCount) {
    // Initiate Layers
    let layers = [new Layer(layersCount[0])];
    for (let i = 1; i < layersCount.length - 1; i++) {
        layers.push(new Layer(layersCount[i]));
    }
    layers.push(new Layer(layersCount[layersCount.length - 1]));

    // Project Layers
    for (let i = 0; i < layers.length - 1; i++) {
        layers[i].project(layers[i + 1]);
    }

    // Split Layers
    let inputLayer = layers[0];
    let hiddenLayers = [];
    for (let i = 1; i < layers.length - 1; i++) {
        hiddenLayers.push(layers[i]);
    }
    let outputLayer = layers[layersCount.length - 1];

    // Activation Function
    for (let i = 0; i < layers.length; i++) {
        layers[i].set({
            squash: Neuron.squash.ReLU
        })
    }

    // Create Network
    let network = new Network({
        input: inputLayer,
        hidden: hiddenLayers,
        output: outputLayer
    });

    // Activation Function
    // let neurons = network.neurons()
    // for (let i = 0; i < neurons.length; i++) {
    //     let neuron = neurons[i].neuron;
    //     if (neurons[i].layer == 0) {
    //         neuron.squash = Neuron.squash.RELU;
    //     } else {
    //         neuron.squash = Neuron.squash.IDENTITY;
    //     }
    //     // neuron.squash = Neuron.squash.LOGISTIC;
    // }

    return network;
}