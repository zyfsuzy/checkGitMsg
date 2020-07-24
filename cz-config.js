/**
 * Created by hanxingda on 2020/07/06
 */
module.exports = {
  types:[
    {
      value: 'feat',
      name: 'feat:       A new feature',
    },
    {
      value: 'fix',
      name: 'fix:        A bug fix',
    },
    {
      value: 'docs',
      name: 'docs:       Documentation only changes',
    },
    {
      value: 'style',
      name: 'style:      Changes that do not affect the meaning of the code',
    },
    {
      value: 'refactor',
      name: 'refactor:   A code change that neither fixes a bug nor adds a feature',
    },
    {
      value: 'test',
      name: 'test:       Adding missing tests',
    },
    {
      value: 'revert',
      name: 'revert:     Revert to a commit',
    },
    {
      value: 'chore',
      name: 'chore:      Changes to the build process or auxiliary tools',
    },
  ],

  // override the messages, defaults are as follows
  messages: {
    type: "Select the type of change that you're committing:",
	scope: 'Denote the SCOPE of this change (optional):',
	// customScope used if allowCustomScopes is true
	customScope: 'Denote the SCOPE of this change:',
	subject: 'Write a SHORT, IMPERATIVE tense description of the change:',
	body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:', 
	breaking: 'List any BREAKING CHANGES (optional):',
	footer: 'JIRA ISSUES CLOSED by this change:',
	confirmCommit: 'Are you sure you want to proceed with the commit above:',
  },
  // skip any questions you want
  skipQuestions: ['scope', 'customScope', 'breaking'],

  // limit subject length
  subjectLimit: 50,

  footerPrefix: 'JIRA Issues:',
};
