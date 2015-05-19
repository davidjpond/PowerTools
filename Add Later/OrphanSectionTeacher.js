// TODO Add OrphanedSectionTeacher Wizard to delete records
OrphanedSectionTeacher: function () {
  powerTools.reportData = {
    title: 'Orphaned SectionTeacher Records',
    header: 'Orphaned SectionTeacher Records in All Schools',
    info: ('This report selects any SectionTeacher Record where the section or teacher does not exist.'),
    fields: ['id', 'teacherId', 'teacherName', 'sectionId', 'courseSection'],
    columns: [{
      key: 'id',
      label: 'ID',
      minWidth: 50,
      sortable: true
    }, {
      key: 'teacherName',
      label: 'Teacher Name',
      minWidth: 200,
      sortable: true,
      formatter: 'TeacherExist'
    }, {
      key: 'courseSection',
      label: 'Course.Section',
      minWidth: 200,
      sortable: true,
      formatter: 'CourseSectionExist'
    }],
    template: powerTools.templateNoCY(),
    sortKey: 'id',
    wizardLink: 1
  };
},