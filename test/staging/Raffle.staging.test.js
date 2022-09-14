const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle unit tests", function () {
          let raffle, raffleEntranceFee, deployer //interval

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer

              raffle = await ethers.getContract("Raffle", deployer)

              raffleEntranceFee = await raffle.getEntranceFee()
              // interval = await raffle.getInterval()
          })
          describe("fulfillRandomsWords", function () {
              it("works with live chainlink keepers and chainlink VRF, we get a random winner", async function () {
                  const startingTimestamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  // setup listener before we enter the raffle
                  // just incase the blockchains moves really fast
                  // different in mock tsting where we can manipulate the blocks
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired up")
                          try {
                              // add our asserts here
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimestamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(e)
                          }
                      })
                      // then entering the  raffle

                      console.log("Entering Raffle...")
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance()

                      //
                  })
              })
          })
      })
