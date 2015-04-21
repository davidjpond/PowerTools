// Create the plugin.xml based on the package.json file.
module.exports = function () {
  'use strict';
  var prefs = require('./preferences.js');
  return {
    "pluginxml": {
      "dist/plugin.xml": function (fs, fd, done) {
        fs.writeSync(
          fd,
            '<?xml version="1.0" encoding="UTF-8"?>\n\n' +
            '<plugin xmlns="http://plugin.powerschool.pearson.com"\n' +
            '\t\txmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
            '\t\txsi:schemaLocation=\'http://plugin.powerschool.pearson.com plugin.xsd\'\n' +
            '\t\tname="' + prefs.project["generator-pearsoncpt"].projectName + '"\n' +
            '\t\tversion="' + prefs.package.version + '"\n' +
            '\t\tdescription="' + prefs.package.description + '">\n\n' +
            '\t<publisher name="' + prefs.package.author.name + '">\n' +
            '\t\t<contact email="' + prefs.package.author.email + '" />\n' +
            '\t</publisher>\n\n' +
            '</plugin>'
        );
        done();
      }
    },
    "jsdocReadme": {
      "grunt/jsdoc-template/README.md": function (fs, fd, done) {
        fs.writeSync(
          fd,
            '## ' + prefs.project["generator-pearsoncpt"].projectName + '\n' +
            prefs.package.description + '\n' +
            '\n' +
            '| Project Information |   |\n' +
            '|---------------------|---|\n' +
            '| Project Version     | ' + prefs.package.version + ' |\n' +
            '| Developed By        | ' + prefs.package.author.name + '  |\n' +
            '| Email Address       |  <' + prefs.package.author.email + '> |\n' +
            '\n' +
            '\n' +
            '\n' +
            '### Customization Support\n' +
            'Pearson, Inc. now includes a Support/Maintenance agreement with your customization.\n' +
            '\n' +
            'Your customization comes with a standard 30-day warranty. The support/maintenance agreement extends the ' +
            'original customization warranty for one (1) calendar year from the day of delivery to insure continued ' +
            'successful operation of the customization throughout the school year.\n' +
            '\n' +
            'This agreement is renewable on a yearly basis and is intended to ensure your customizations continue to ' +
            'operate as originally designed. This agreement does not cover changes that are out of scope of the ' +
            'original customization nor does it include changes or enhancements to the customization provided.\n' +
            '\n' +
            'This agreement protects your investment from upgrades to the PowerSchool product. For example, if you ' +
            'upgrade your PowerSchool installation from version 7 to version 8, and your customization becomes ' +
            'inoperable due to the upgrade, we will diagnose and repair it for no charge.\n' +
            '\n' +
            '1. Client’s PowerSchool standard annual support charges for the SIS do not include support for custom ' +
            'work or software customizations.\n' +
            '2. Pearson does warrant after delivery that the customization supplied by Pearson pursuant to this ' +
            'Statement of Work will substantially conform to the specifications provided herein. The standard ' +
            'warranty will expire 30 days after delivery. If selected, the annual support/maintenance agreement ' +
            'will extend this warranty to one (1) year from date of delivery. The foregoing warranty shall not ' +
            'apply if any of the customization work is modified by Client or is used in a manner that does not ' +
            'conform to the instructions provided by Pearson, if any. If the customization does not meet the ' +
            'requirements of this warranty, Client shall be responsible to so notify Pearson in writing during the ' +
            'warranty period and provide Pearson with sufficient detail to allow Pearson to reproduce the problem. ' +
            'After receiving such notification, Pearson will undertake to correct the problem by programming ' +
            'corrections and/or reasonable “work-around” solutions. If Pearson is unable to correct the problem ' +
            'after a reasonable opportunity, Pearson will, at Client’s request, refund the fees paid for such ' +
            'custom work and Client’s license to use such custom work will terminate. The foregoing states the ' +
            'complete and entire remedies that Client has under this warranty. Pearson shall have no responsibility ' +
            'for any warranty claims made outside of the warranty period.\n' +
            '3. If Client requests modifications or additions to the custom work either during or after Pearson\'s ' +
            'development of the customization, such rework or additional work due to Client-requested modifications ' +
            'or additions shall be performed at an additional cost. Pearson will provide Client with an additional ' +
            'cost quote in response to Client’s requests.\n' +
            '4. Client acknowledges that, unless otherwise expressly agreed in writing by Pearson, all custom work ' +
            'performed under this SOW shall be subject to resource availability, and that the fees set forth on the ' +
            'Quotation are an estimate of the total cost. Pearson cannot guarantee a timeframe for delivery. If the ' +
            'total number of hours needed to create and deliver this specific custom work exceeds the allocated ' +
            'project hours, Pearson will provide Client with an additional quote of the time required to complete ' +
            'the custom work in progress. In addition, Client acknowledges that during the production of the ' +
            'deliverables it may be necessary for Pearson, due to limitations associated with the SIS or related ' +
            'database, to create a work-around or reevaluate the specifications associated with a deliverable to ' +
            'either provide the deliverable or deliver comparable results. Any such deviations that arise during the ' +
            'project shall be managed with a Project Change Request and may result in adjustments to the ' +
            'Deliverables and additional charges. Pearson may, at its option, require a purchase order for this ' +
            'additional amount in order to proceed. Client’s standard annual support charges for the SIS do not ' +
            'include support for custom work or other software customizations.\n' +
            '5. This SOW does not include any technical support required to achieve necessary access to Client ' +
            'resources needed for completion of this custom work. These resources include but are not limited to ' +
            'PSAdmin, database access and server file system access. Additional time or materials needed to secure ' +
            'necessary access may require additional funds to ensure completion of the custom work.\n' +
            '6. All deliverables will be based upon the feature functionality of a single released version of the ' +
            'SIS and Pearson will use such version for the creation of the deliverables. Pearson makes no ' +
            'representation or warranty that the deliverables provided will functions or be compatible with any ' +
            'version of the SIS other than the version used by Pearson in the creation of the deliverables.\n' +
            '7. This Statement of Work does not include ongoing technical support and updates to the work developed ' +
            'in this Statement of Work. Client is solely responsible for ensuring that any deliverable created under ' +
            'this Statement of Work will work on versions of the SIS other than the version upon which the ' +
            'deliverables were created.\n' +
            '8. The services contemplated by this SOW do not include any training, support, or modifications for the ' +
            'deliverables. If Client desires any such training, support or modifications Pearson may provide those ' +
            'items at an additional charge to be determined through a Project Change Request.\n' +
            '9. All rights, title, and interest in any know-how, trade secret information, and all copyrightable ' +
            'material, copyrights, and copyright applications which Pearson conceives or originates, either ' +
            'individually or jointly with others, and which arise out of the performance of this SOW, will be the ' +
            'property of Pearson. Works of authorship created by Pearson in the performance of this Statement of ' +
            'Work are not “works made for hire” as defined under U.S. Copyright Law.\n' +
            '10. All work performed under this Statement of Work shall be subject to the applicable SIS license ' +
            'agreement by and between Pearson and Client and no other rights, title, interest, or license to the ' +
            'deliverables, whether express or implied, is granted to Client.\n' +
            '11. Pearson will have fulfilled its obligations under this Statement of Work when upon the occurrence ' +
            'of the provision of the deliverables to Client. If the total number of hours needed to perform the custom ' +
            'work exceeds the allocated project hours, Pearson will provide Client with an additional quote of the ' +
            'time required to complete the custom work.\n' +
            '\n' +
            '### Payment Terms\n' +
            'All service fees are due upon receipt of invoice(s).\n' +
            '### Project Change Control Procedure\n' +
            'The following process will be followed if a change to this Scope of Work is required.\n' +
            '\n' +
            '  * A Project Change Request (PCR) will be the vehicle for communicating change. The PCR must describe the ' +
            'change; the rationale for the change and the effect the change will have on the project.\n' +
            '  * The designated Program/Project Manager of the requesting party will review the proposed change and ' +
            'determine whether to submit the request to the other party.\n' +
            '  * Both Program/Project Managers will review the proposed change and recommend it for further ' +
            'investigation or reject it. Pearson will specify any charges for such investigation. A PCR must be signed ' +
            'by authorized representatives from both parties to authorize investigation of the recommended changes. ' +
            'Pearson will invoice the client for any such charges. The investigation will determine the effect that ' +
            'the implementation of the PCR will have on price, schedule and other terms and conditions of the Contract.\n' +
            '  * A written Change Authorization and/or PCR must be signed by authorized representatives from both ' +
            'parties to authorize implementation of the investigated changes. Until a change is agreed in writing, ' +
            'both parties will continue to act in accordance with the latest agreed version of the SOW.\n' +
            '\n' +
            '### Requesting Support\n' +
            'Pearson has established a support process to ensure a timely response to your maintenance agreement ' +
            'requests. (Monday – Friday; 6:00 AM – 8:00 PM EST)\n' +
            '\n' +
            '(Excludes Pearson Holidays)\n' +
            '\n' +
            '**Note:** Technical Support is only provided to the technical contacts designated by SCDE\n' +
            '\n' +
            '  * Pearson Technical Support:\n' +
            '    1. PHONE: 866-434-6276\n' +
            '    2. EMAIL: <powerschoolsupport@pearson.com>\n' +
            '    3. CHAT: https://powersource.pearsonschoolsystems.com\n' +
            '    4. On-Line Case Logging: https://powersource.pearsonschoolsystems.com\n' +
            '    5. Knowledge Base: https://powersource.pearsonschoolsystems.com\n' +
            '\n' +
            '### Escalation Procedure\n' +
            'The following procedure will be followed if resolution is required to a conflict arising during the ' +
            'performance of this SOW.\n' +
            'When a conflict arises between the client and Pearson, the project team member(s) will first strive to ' +
            'work out the problem internally.\n' +
            '\n' +
            '  * Level 1: If the project team cannot resolve the conflict within two (2) working days, the client ' +
            'Primary Contact and Pearson Project Manager/Lead Developer will meet to resolve the issue.\n' +
            '  * Level 2: If the conflict is not resolved within three (3) working days after being escalated to Level ' +
            '1, the client Primary Contact and/or member of management will meet with David Lee (Manager of Curriculum ' +
            'and Product Tailoring QA) &lt;<David.X.Lee@pearson.com>&gt; to resolve the issue.\n' +
            '  * Level 3: If the conflict remains unresolved after Level 2 intervention, resolution will be addressed ' +
            'in accordance with Project Change Control Procedure or termination of this SOW under the terms of the ' +
            'Contract.\n' +
            '  * During any conflict resolution, Pearson agrees to provide services relating to items not in dispute, ' +
            'to the extent practicable pending resolution of the conflict. The client agrees to pay invoices per ' +
            'the Contract, as rendered.\n' +
            '\n' +
            '## Curriculum and Product Tailoring\n' +
            'Curriculum and Product Tailoring provides "customizations" and post-implementation "client services" that ' +
            'tailor out platform solutions to meet the individual needs of each customer to strengthen their ability to ' +
            'improve student outcomes. The results are improved adoption, utilization, long-term value, and increased ' +
            'renewals for platform product and services\n' +
            '\n' +
            '###Contact Information\n' +
            '  * Email: <curriculumproducttailoring@pearson.com>\n' +
            '  * Fax: 847-486-3122\n' +
            '  * [Curriculum and Product Tailoring on PowerSource]' +
            '(https://powersource.pearsonschoolsystems.com/f/customization_services)'
        )
        ;
        done();
      }
    }
  };
};
