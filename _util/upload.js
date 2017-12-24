
const fs = require('fs');
const path = require('path');
const ns = 'proterra.quiz';
let srcJson = JSON.parse(fs.readFileSync('data.json','utf-8'));

let bnConnection = new BusinessNetworkConnection();
let bnDefn = await bnConnection.connect(cardName);
let factory = bnDefn.getFactory();


let registries = bnDefn.getAllAssetRegistries().reduce(
     
);


srcJson.quizes.forEach((e)=>{
    let quiz = factory.newResource(ns,'Quiz',e.year);
    quiz.name=e.theme;
    quiz.description=e.description;

    // loop around questions and answers


    // add asset
    console.log(e.year);
})

// disconnect