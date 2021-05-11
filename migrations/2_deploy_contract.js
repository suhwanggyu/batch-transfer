const Batch = artifacts.require("batch/Batch");
const ATK = artifacts.require("testtoken/ATK");
const BTK = artifacts.require("testtoken/BTK");
const CTK = artifacts.require("testtoken/CTK");
const IBatch = artifacts.require("batch/IBatch");
module.exports = async function(deployer) {
    await deployer.deploy(Batch);
    await deployer.deploy(ATK);
    await deployer.deploy(BTK);
    await deployer.deploy(CTK);

    let batch = await Batch.deployed();
    let atk = await ATK.deployed();
    let btk = await BTK.deployed();
    let ctk = await CTK.deployed();

    batch.addToken("ATK", atk.address);
    batch.addToken("BTK", btk.address);
    batch.addToken("CTK", ctk.address);
}