const IBatch = artifacts.require("batch/IBatch");
const IDefaultBatch = artifacts.require("batch/IDefaultBatch");
const ATK = artifacts.require("testtoken/ATK");
const BTK = artifacts.require("testtoken/BTK");
const CTK = artifacts.require("testtoken/CTK");
const Factory = artifacts.require("Factory");

const gasCalculator = 0.00077;

contract('Batch', async function(accounts) {
    /*
        Test for Ethereum batch transfer with same amount
    */
    it("Batch ethereum transfer", async() => {
        const factory = await Factory.deployed();
        const batch = await IDefaultBatch.at(await factory.getDefault());
        let amount = 10**17;
        let targetAddress = accounts.slice(2, 10);
        let owner = accounts[1];
        let value = amount * targetAddress.length;

        // make expected result of batch processing
        let origin = [];
        let expected = [];
        for(let i = 0; i < targetAddress.length; i++)  origin.push(await web3.eth.getBalance(targetAddress[i]));
        for(let i = 0; i < targetAddress.length; i++)  expected.push(Number(origin[i]) + Number(amount));
        let after = await batch.transfer(targetAddress, web3.utils.toBN(amount), {from : owner, value: web3.utils.toBN(value)});
        for(let i = 0; i < targetAddress.length; i++) assert.equal(await web3.eth.getBalance(targetAddress[i]), expected[i]);

        // make non-batch expected result
        origin = [];
        expected = [];
        for(let i = 0; i < targetAddress.length; i++) origin.push(await web3.eth.getBalance(targetAddress[i]));
        for(let i = 0; i < targetAddress.length; i++) expected.push(Number(origin[i]) + Number(amount));

        let sum = 0;
        for(let i = 0; i < targetAddress.length; i++) {
            let tx = {
                from: owner,
                to: targetAddress[i],
                value: amount
            };
            res = await web3.eth.sendTransaction(tx);
            sum += Number(res.gasUsed);
        }
        for(let i = 0; i < targetAddress.length; i++) {
            assert.equal(await web3.eth.getBalance(targetAddress[i]), expected[i]);
        }

        console.log("Used gas of batch process : " + after.receipt.gasUsed);
        console.log("Used gas of non batch process :  " + sum);
        console.log("The difference is " + ((sum - after.receipt.gasUsed) * gasCalculator) + "$");
        assert(after.receipt.gasUsed < sum);
    });
    
    it("Batch ethereum transfer with different value", async() => {
        const factory = await Factory.deployed();
        const batch = await IDefaultBatch.at(await factory.getDefault());
        let amount = [];
        let targetAddress = accounts.slice(2, 10);
        let owner = accounts[0];
        for(let i = 0; i < 8; i++) amount.push(web3.utils.toBN((10 ** 17) * Math.floor(Math.random() * 5)));
        let value = 0;
        for(let i = 0; i < 8; i++) value += Number(amount[i].toString());
        // make expected result of batch processing
        let origin = [];
        let expected = [];
        for(let i = 0; i < targetAddress.length; i++)  origin.push(await web3.eth.getBalance(targetAddress[i]));
        for(let i = 0; i < targetAddress.length; i++)  expected.push(Number(origin[i]) + Number(amount[i].toString()));

        // execute and test
        let after = await batch.transferEthWithDifferentValue(targetAddress, amount, {from : owner, value: web3.utils.toBN(value)});
        for(let i = 0; i < targetAddress.length; i++) assert.equal(await web3.eth.getBalance(targetAddress[i]), expected[i]);

        // make non-batch expected result
        origin = [];
        expected = [];
        for(let i = 0; i < targetAddress.length; i++) origin.push(await web3.eth.getBalance(targetAddress[i]));
        for(let i = 0; i < targetAddress.length; i++) expected.push(Number(origin[i]) + Number(amount[i].toString()));

        let sum = 0;
        for(let i = 0; i < targetAddress.length; i++) {
            let tx = {
                from: owner,
                to: targetAddress[i],
                value: amount[i]
            };
            res = await web3.eth.sendTransaction(tx);
            sum += Number(res.gasUsed);
        }
        for(let i = 0; i < targetAddress.length; i++) {
            assert.equal(await web3.eth.getBalance(targetAddress[i]), expected[i]);
        }

        console.log("Used gas of batch process : " + after.receipt.gasUsed);
        console.log("Used gas of non batch process :  " + sum);
        console.log("The difference is " + ((sum - after.receipt.gasUsed) * gasCalculator) + "$");
        assert(after.receipt.gasUsed < sum);
    });
    /*
        Test for erc20 batch transfer with different amount
    */
    it("Batch erc20", async() => {
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
        let owner = accounts[0];
        let saveMoney = web3.utils.toBN(10 ** 20);
        const TestCase = 100;
        for(let i = 0; i < TestCase; i++) targetAddress.push(await web3.eth.accounts.create().address);
        for(let i = 0; i < TestCase; i++) amount.push(web3.utils.toBN(10 ** 18));
        for(let i = 0; i < TestCase; i++) tokens.push(tok[Math.floor(Math.random() * 3)]);
        
        await atk.transfer(batch.address, saveMoney, {from : owner});
        await btk.transfer(batch.address, saveMoney, {from : owner});
        await ctk.transfer(batch.address, saveMoney, {from : owner});
        assert.equal((await atk.balanceOf(batch.address)).toString(), saveMoney.toString());
        assert.equal((await btk.balanceOf(batch.address)).toString(), saveMoney.toString());
        assert.equal((await ctk.balanceOf(batch.address)).toString(), saveMoney.toString());

        origin = [];
        expected = [];

        for(let i = 0; i < targetAddress.length; i++) {
            switch(tokens[i]) {
                case "ATK" :
                    origin.push(await atk.balanceOf(targetAddress[i]));
                    break;
                case "BTK" :
                    origin.push(await btk.balanceOf(targetAddress[i]));
                    break;
                case "CTK" :
                    origin.push(await ctk.balanceOf(targetAddress[i]));
                    break;
            }
        }

        for(let i = 0; i < targetAddress.length; i++) {
            expected.push(Number(origin[i]) + Number(amount[i]));
        }
        
        let tx = await batch.batch(targetAddress, tokens, amount, {from: owner});
        for(let i = 0; i < targetAddress.length; i++) {
            switch(tokens[i]) {
                case "ATK" :
                    assert.equal(await atk.balanceOf(targetAddress[i]), expected[i]);
                    break;
                case "BTK" :
                    assert.equal(await btk.balanceOf(targetAddress[i]), expected[i]);
                    break;
                case "CTK" :
                    assert.equal(await ctk.balanceOf(targetAddress[i]), expected[i]);
                    break;
            }
        }
        let sum = 0;
        for(let i = 0; i < targetAddress.length; i++) {
            let t = 0;
            switch(tokens[i]) {
                case "ATK" :
                    t = await atk.transfer(targetAddress[i], amount[i], {from : owner});
                    break;
                case "BTK" :
                    t = await atk.transfer(targetAddress[i], amount[i], {from : owner});
                    break;
                case "CTK" :
                    t = await atk.transfer(targetAddress[i], amount[i], {from : owner});
                    break;
            }
            sum += Number(t.receipt.gasUsed);
        }
        console.log("Used gas of batch process : " + tx.receipt.gasUsed);
        console.log("Used gas of non batch process :  " + sum);
        console.log("The difference is " + ((sum - tx.receipt.gasUsed) * gasCalculator) + "$");
    });
});