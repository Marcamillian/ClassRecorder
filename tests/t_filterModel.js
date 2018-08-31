let FilterModel = require('../src/scripts/FilterModel.js');
let test = require('tape');

test("Testing filter creation", (t)=>{
  
  t.test("Testing arguments supplied", (ts)=>{
    let filterModel = new FilterModel({filterClass:1, filterLesson: 2, filterStudent:3});

    let result = filterModel.filterSettings

    ts.equal(result.class, 1, "Class is set in constructor");
    ts.equal( result.lesson, 2, "Lesson set on constructor");
    ts.equal( result.student, 3, "Student set on constructor");

    ts.end()
  })

  t.test("Testing no argument case", (ts)=>{
    let filterModel = new FilterModel();

    let result = filterModel.filterSettings;

    ts.equal(result.class, undefined, "class undefined on constructor");
    ts.equal(result.lesson, undefined, "Lesson undefined on constructor");
    ts.equal(result.student, undefined, "Student undefined on constructor")

    ts.end()

  })

  t.test("Testing partial creation", (ts)=>{
    let filterModel = new FilterModel({ filterClass:1, filterLesson:2 });

    let result = filterModel.filterSettings;

    ts.equal(result.class, 1, "Class set on constructor")
    ts.equal(result.lesson, 2, "Lesson set on constructor");
    ts.equal(result.student, undefined, "Student not set on constructor")

    ts.end()
  })
  
  t.end()

})

test("Testing setFilter()", (t)=>{
  
  t.test("Testing class setting", (ts)=>{
    let filter = new FilterModel();

    filter.setFilter({filterType: 'class', filterOption: 1});

    let result = filter.filterSettings;

    ts.equal(result.class, 1, "Class set propperly");
    ts.equal( result.lesson, undefined, "Lesson not set");
    ts.equal(result.student, undefined, "Student not set");
    
    ts.end()

  })

  t.test("Testing lesson setting", (ts)=>{
    let filter = new FilterModel({filterClass:1});

    filter.setFilter({filterType:'lesson', filterOption:2});

    let result = filter.filterSettings;

    ts.equal(result.class, 1, "Class is set propperly");
    ts.equal( result.lesson, 2, "lesson is set");
    ts.equal(result.student, undefined, "Student not set yet")

    ts.end()
  })

  t.test("Testing student setting", (ts)=>{
    let filter = new FilterModel({filterClass:1, filterLesson:2});

    filter.setFilter({filterType: 'student', filterOption: 1});

    let result = filter.filterSettings;

    ts.equal( result.class, 1);
    ts.equal( result.lesson, 2);
    ts.equal( result.student, 1);

    ts.end()
  })


  t.test("Testing resetting of filter class", (ts)=>{

    let filter = new FilterModel({filterClass:1, filterLesson:2, filterStudent: 3});

    filter.setFilter({filterType: 'class', filterOption:3});

    let result = filter.filterSettings;

    ts.equal(result.class, 3);
    ts.equal( result.lesson, undefined);
    ts.equal( result.student, undefined);

    ts.end()

  })

  t.test("Testing resetting of filter class to undefined", (ts)=>{

    let filter = new FilterModel({filterClass:1, filterLesson:2, filterStudent: 3});

    filter.setFilter({filterType: 'class', filterOption:undefined});

    let result = filter.filterSettings;

    ts.equal(result.class, undefined);
    ts.equal( result.lesson, undefined);
    ts.equal( result.student, undefined);

    ts.end()

  })

  t.test("Testing resetting of filter lesson", (ts)=>{

    let filter = new FilterModel({filterClass:1, filterLesson:2, filterStudent: 3});

    filter.setFilter({filterType: 'lesson', filterOption:3});

    let result = filter.filterSettings;

    ts.equal(result.class, 1);
    ts.equal( result.lesson, 3);
    ts.equal( result.student, undefined);

    ts.end()

  })

  t.test("Testing resetting of filterClass", (ts)=>{
    let filter = new FilterModel({filterClass:1, filterLesson:2, filterStudent: 3});

    filter.setFilter({filterType:'student', filterOption:4});

    let result = filter.filterSettings;

    ts.equal(result.class, 1);
    ts.equal(result.lesson, 2);
    ts.equal(result.student, 4);

    ts.end()
  })


})
