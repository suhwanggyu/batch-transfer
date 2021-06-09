const IBatch = artifacts.require("batch/IBatch");
const ATK = artifacts.require("testtoken/ATK");
const BTK = artifacts.require("testtoken/BTK");
const CTK = artifacts.require("testtoken/CTK");
const Factory = artifacts.require("Factory");
const Batch = artifacts.require("batch/Batch.sol");


contract('Batch', async(accounts) => {

    it("UnAuthorized access", async() => {
        const factory = await Factory.deployed();
        await factory.generateBatch(accounts[0]);
        const batch = await IBatch.at((await factory.getBatches(accounts[0]))[0]);
        let atk = await ATK.deployed();
        let btk = await BTK.deployed();
        let ctk = await CTK.deployed();
        batch.addToken("ATK", atk.address);
        batch.addToken("BTK", btk.address);
        batch.addToken("CTK", ctk.address);
        const tok = ["ATK", "BTK", "CTK"];
        let targetAddress = [], amount = [], tokens = [];
        const TestCase = 100;
        for(let i = 0; i < TestCase; i++) targetAddress.push(await web3.eth.accounts.create().address);
        for(let i = 0; i < TestCase; i++) amount.push(web3.utils.toBN(10 ** 18));
        for(let i = 0; i < TestCase; i++) tokens.push(tok[Math.floor(Math.random() * 3)]);
        try{
            let tx = await batch.batch(targetAddress, tokens, amount, {from: accounts[1]});
        } catch (e) {
            assert.equal('Transfer: not allowed account', e.reason);
        }
    });


    it("UnAuthorized withdraw", async() => {
        const factory = await Factory.deployed();
        const owner = accounts[0];
        const attacker = accounts[5];
        await factory.generateBatch(owner);
        const batch = await Batch.at((await factory.getBatches(owner))[0]);
        let atk = await ATK.deployed();
        let btk = await BTK.deployed();
        let ctk = await CTK.deployed();
        batch.addToken("ATK", atk.address);
        batch.addToken("BTK", btk.address);
        batch.addToken("CTK", ctk.address);
        const tok = ["ATK", "BTK", "CTK"];
        let saveMoney = web3.utils.toBN(10 ** 20);
        await atk.transfer(batch.address, saveMoney, {from : owner});
        await btk.transfer(batch.address, saveMoney, {from : owner});
        await ctk.transfer(batch.address, saveMoney, {from : owner});
        try{
            let tx = await batch.withdraw(saveMoney, tok[1], {from : attacker});
        } catch (e) {
            assert.equal('Transfer: not allowed account', e.reason);
        }
    });

    it("Authorized withdraw", async() => {
        const factory = await Factory.deployed();
        const owner = accounts[0];
        await factory.generateBatch(owner);
        const batch = await Batch.at((await factory.getBatches(owner))[0]);
        let atk = await ATK.deployed();
        let btk = await BTK.deployed();
        let ctk = await CTK.deployed();
        batch.addToken("ATK", atk.address);
        batch.addToken("BTK", btk.address);
        batch.addToken("CTK", ctk.address);
        const tok = ["ATK", "BTK", "CTK"];
        let saveMoney = web3.utils.toBN(10 ** 20);
        let amount = await atk.balanceOf(owner);
        await atk.transfer(batch.address, saveMoney, {from : owner});
        await btk.transfer(batch.address, saveMoney, {from : owner});
        await ctk.transfer(batch.address, saveMoney, {from : owner});
        assert.equal(Number(amount) - Number(saveMoney), await atk.balanceOf(owner));
        let tx = await batch.withdraw(saveMoney, tok[0], {from : owner});
        assert.equal(Number(amount), Number(await atk.balanceOf(owner)));
    });
});