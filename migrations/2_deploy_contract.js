const ATK = artifacts.require("testtoken/ATK");
const BTK = artifacts.require("testtoken/BTK");
const CTK = artifacts.require("testtoken/CTK");
const Factory = artifacts.require("Factory");
const Batch = artifacts.require("batch/Batch");

module.exports = async function(deployer) {
    await deployer.deploy(Factory);
    await deployer.deploy(ATK);
    await deployer.deploy(BTK);
    await deployer.deploy(CTK);

    let factory = await Factory.deployed();
    await factory.generateBatch("0x340D62C756523D3065651d7abE2EEEB45738F85D");
    await factory.generateBatch("0x340D62C756523D3065651d7abE2EEEB45738F85D");
    await factory.generateBatch("0x340D62C756523D3065651d7abE2EEEB45738F85D");
    let add = await factory.getBatches("0x340D62C756523D3065651d7abE2EEEB45738F85D");
    let atk = await ATK.deployed();
    let btk = await BTK.deployed();
    let ctk = await CTK.deployed();
    let batch = await Batch.at(add[0]);
    batch.addToken("ATK", atk.address);
    batch.addToken("BTK", btk.address);
    batch.addToken("CTK", ctk.address);
}