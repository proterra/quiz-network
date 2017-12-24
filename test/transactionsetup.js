
const Table = require('cli-table');
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const Pretty = require('prettyjson');

// Require the client API
const BusinessNetworkConnection = require("composer-client").BusinessNetworkConnection;
const BusinessNetworkDefinition = require("composer-common").BusinessNetworkDefinition;
const AdminConnection = require("composer-admin").AdminConnection;
const IdCard = require('composer-common').IdCard;
const MemoryCardStore = require('composer-common').MemoryCardStore;
const store = new MemoryCardStore();

// the logical business newtork has an indentifier
let businessNetworkIdentifier = "recursive-asset";
let businessNetworkConnection;
let businessNetworkDefinition;
let bnDirectory = '..'
let bna = '../dist/quiz-network.bna'
let serializer;

const deploy=false;

let deployCardName = 'deployer-card';
let userCardName = 'user-card';
let userCardFileName= './user.card';

// rather than use console.log use more like a debug fn call
const LOG = {
  info: (string) => {
    console.log(string);
  }
};

// Create the Admin and Business Network Connecton backed by the in memory Network Card Store
const adminConnection = new AdminConnection({ cardStore: store });
// businessNetworkConnection = new BusinessNetworkConnection({ cardStore: store });
businessNetworkConnection = new BusinessNetworkConnection();



async function listRegistries() {
  result = await businessNetworkConnection.getAllAssetRegistries(true);
  LOG.info("> List of asset registries (including system)");
  let tableAssets = new Table({
    head: ["Registry Type", "ID", "Name"]
  });
  for (let i = 0; i < result.length; i++) {
    let tableLine = [];

    tableLine.push(result[i].registryType);
    tableLine.push(result[i].id);
    tableLine.push(result[i].name);
    tableAssets.push(tableLine);
  }

  LOG.info(tableAssets.toString());

  result = await businessNetworkConnection.getAllParticipantRegistries(true);
  LOG.info("> List of participant registries (including system)");
  let tableParticipants = new Table({
    head: ["Registry Type", "ID", "Name"]
  });

  for (let i = 0; i < result.length; i++) {
    let tableLine = [];

    tableLine.push(result[i].registryType);
    tableLine.push(result[i].id);
    tableLine.push(result[i].name);
    tableParticipants.push(tableLine);
  }
  LOG.info(tableParticipants.toString());
}


async function runsetup() {

  let factory = businessNetworkDefinition.getFactory();
  let setupTx = factory.newTransaction('proterra.quiz', 'SetupData');
  setupTx.rawJSONData = fs.readFileSync('./data.json','utf-8');

  await businessNetworkConnection.submitTransaction(setupTx);


  serializer = businessNetworkDefinition.getSerializer();

  quizRegistry = await businessNetworkConnection.getRegistry('proterra.quiz.Quiz');
  let quiz2015 = await quizRegistry.getAll();
  quiz2015.forEach((e)=>{
    console.log(serializer.toJSON(e));
  });


}

function readCardFromFile(cardFileName) {
  const cardFilePath = path.resolve(cardFileName);
  let cardBuffer;
  try {
      cardBuffer = fs.readFileSync(cardFilePath);
  } catch (cause) {
      const error = new Error(`Unable to read card file: ${cardFilePath}`);
      error.cause = cause;
      return Promise.reject(error);
  }

  return IdCard.fromArchive(cardBuffer);
}


// -----------------------------------------------------------------------------
// main code starts here
(async () => {


  try {
    
    // Dynamically create two IdCards for the 
    // let idCard_PeerAdmin = new IdCard({ userName: 'PeerAdmin' }, { type: "embedded", name: "profilename" });
    // idCard_PeerAdmin.setCredentials({ certificate: 'cert', privateKey: 'key' })

    if (deploy){
      LOG.info('> Importing the card')
      await adminConnection.importCard('deployer-card', idCard_PeerAdmin)

      // Load the Business network from disk
      // businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory( path.resolve(bnDirectory) );
      businessNetworkDefinition = await BusinessNetworkDefinition.fromArchive(fs.readFileSync(path.resolve(bna)));

      // connect and deploy the business network
      LOG.info('> Installing the Composer Runtime');
      await adminConnection.connect(deployCardName);
      await adminConnection.install(businessNetworkDefinition.getName());

      // Start the business network on the installed runtime
      LOG.info("> Starting Business Network on the installed Composer runtime...");
      let cards = await adminConnection.start(businessNetworkDefinition, { networkAdmins: [{ userName: 'admin', enrollmentSecret: 'adminpw' }] });
      let card = cards.get('admin')
      // don't need the adminConnection now so disconnect
      await adminConnection.disconnect(); 
    }

    
    await adminConnection.importCard(userCardName, await readCardFromFile(userCardFileName));

    LOG.info('> Deployed network - now Connecting business network connection');
    businessNetworkDefinition = await businessNetworkConnection.connect('admin@quiz-local');

    // do code here............
    await runsetup();

    await businessNetworkConnection.disconnect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

})();