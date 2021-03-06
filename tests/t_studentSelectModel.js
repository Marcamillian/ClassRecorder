let test = require('tape');
let PageModel = require('../src/scripts/StudentSelectModel.js');

//console.log(pageModel)

test("Testing page rotations",(t)=>{

    let pageModel = new PageModel;
    
    t.equals(pageModel.currentPage, "class", "testing the first thing");

    t.equals(pageModel.nextPage(), "lesson", "checking the next page");

    t.equals(pageModel.nextPage(), "student", "checking the last page")

    t.throws(()=>{pageModel.nextPage()}, /Page limit reached/i, "page limit hit");
    t.equals(pageModel.currentPage, "student", "pageName is correct at top")

    pageModel.prevPage();
    pageModel.prevPage();

    t.throws(()=>{pageModel.prevPage()}, /Page limit reached/i, "bottom page limit hit")
    t.equals(pageModel.currentPage, "class", "pageName is correct at the bottom")


    t.end()
})

test("Testing option setting", (t)=>{
    let pageModel = new PageModel;
    var result;

    // select the class
    pageModel.selectOption(1);
    // change page
    pageModel.nextPage();
    // select the lesson
    pageModel.selectOption(2);
    // change page
    pageModel.nextPage();
    // select the student
    pageModel.selectOption(3);

    result = pageModel.getSelectedOptions();

    t.equals(result.class, 1, "class set propperly");
    t.equals(result.lesson, 2, "lesson set");
    t.equal(result.student.length, 1, "number of students correct")
    t.equal(result.student.includes(3), true, "Correct studentId in option")

    t.end()
})

test("Testing option removal", (t)=>{

    t.test("test single removal",(ts) =>{

        let pageModel = new PageModel;
        var result;

        // select the class
        pageModel.selectOption(1);
        result = pageModel.getSelectedOptions();
        ts.equals(result.class, 1, "class set propperly");

        // remove the class
        pageModel.clearOption('class');
        result = pageModel.getSelectedOptions();
        ts.equals(result.class, undefined, "class been cleared")

        //chage the page to the students
        pageModel.nextPage()
        pageModel.nextPage()

        pageModel.selectOption(4);
        pageModel.selectOption(5);
        result = pageModel.getSelectedOptions();
        ts.equals(result.student.length, 2, "Student array right length");
        ts.equals(result.student.includes(5), true, "StudentId 5 listed");
        ts.equals(result.student.includes(4), true, "studentId 4 listed");

        pageModel.clearOption('student');
        result = pageModel.getSelectedOptions();
        ts.equals(result.student.length, 0, "All selected students removed")


        ts.end()
    })

    t.test("clear root class element", (ts)=>{
        let pageModel = new PageModel;

        var result;

        // set class
        pageModel.selectOption(1);

        // set lesson
        pageModel.nextPage();
        pageModel.selectOption(2);

        // set student
        pageModel.nextPage();
        pageModel.selectOption(3)

        result = pageModel.getSelectedOptions();

        ts.equals(result.class,1, "class set");
        ts.equals(result.lesson,2, "lesson set");
        ts.equals(result.student[0], 3, "student set")

        pageModel.clearOption("lesson");

        ts.equals(result.lesson, undefined, "lesson cleared");
        ts.equals(result.student.length, 0, "student cleared")

        pageModel.clearOption("class");
        ts.equals(result.class, undefined, "class cleared");

        ts.end()

    })

    t.end()
    
})