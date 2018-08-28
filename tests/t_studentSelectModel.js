let test = require('tape');
let PageModel = require('../src/scripts/studentSelectModel.js');

//console.log(pageModel)

test("Testing page rotations",(t)=>{

    let pageModel = new PageModel;
    
    t.equals(pageModel.getPage(), "class", "testing the first thing");

    t.equals(pageModel.nextPage(), "lesson", "checking the next page");

    t.equals(pageModel.nextPage(), "student", "checking the last page")

    //t.throws(()=>{pageModel.nextPage()}, /Page limit reached/i, "top page limit reached")

    //pageModel.prevPage();
    //pageModel.prevPage();


    t.end()
})
