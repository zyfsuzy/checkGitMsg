const _ = require('lodash');
const buildCommit = require('./buildCommit');
const log = require('./logger');

const isNotWip = (answers) => answers.type.toLowerCase() !== 'wip';

const isValidateTicketNo = (value, config) => {
  if (!value) {
    return !config.isTicketNumberRequired;
  }
  if (!config.ticketNumberRegExp) {
    return true;
  }
  const reg = new RegExp(config.ticketNumberRegExp);
  if (value.replace(reg, '') !== '') {
    return false;
  }
  return true;
};

module.exports = {
  getQuestions(config, cz) {
    // normalize config optional options
    const scopeOverrides = config.scopeOverrides || {};
    const messages = config.messages || {};
    const skipQuestions = config.skipQuestions || [];

    messages.type = messages.type || "Select the type of change that you're committing:";
    messages.scope = messages.scope || '\nDenote the SCOPE of this change (optional):';
    messages.customScope = messages.customScope || 'Denote the SCOPE of this change:';
    if (!messages.ticketNumber) {
      if (config.ticketNumberRegExp) {
        messages.ticketNumber =
          messages.ticketNumberPattern ||
          `Enter the ticket number following this pattern (${config.ticketNumberRegExp})\n`;
      } else {
        messages.ticketNumber = 'Enter the ticket number:\n';
      }
    }
    messages.subject = messages.subject || 'Write a SHORT, IMPERATIVE tense description of the change:\n';
    messages.body =
      messages.body || 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n';
    messages.breaking = messages.breaking || 'List any BREAKING CHANGES (optional):\n';
    messages.confirmCommit = messages.confirmCommit || 'Are you sure you want to proceed with the commit above?';

    let questions = [
      {
        type: 'list',
        name: 'type',
        message: messages.type,
        choices: config.types,
      },
      {
        type: 'list',
        name: 'scope',
        message: messages.scope,
        choices(answers) {
          let scopes = [];
          if (scopeOverrides[answers.type]) {
            scopes = scopes.concat(scopeOverrides[answers.type]);
          } else {
            scopes = scopes.concat(config.scopes);
          }
          if (config.allowCustomScopes || scopes.length === 0) {
            scopes = scopes.concat([
              new cz.Separator(),
              { name: 'empty', value: false },
              { name: 'custom', value: 'custom' },
            ]);
          }
          return scopes;
        },
        when(answers) {
          let hasScope = false;
          if (scopeOverrides[answers.type]) {
            hasScope = !!(scopeOverrides[answers.type].length > 0);
          } else {
            hasScope = !!(config.scopes && config.scopes.length > 0);
          }
          if (!hasScope) {
            // TODO: Fix when possible
            // eslint-disable-next-line no-param-reassign
            answers.scope = 'custom';
            return false;
          }
          return isNotWip(answers);
        },
      },
      {
        type: 'input',
        name: 'scope',
        message: messages.customScope,
        when(answers) {
          return answers.scope === 'custom';
        },
      },
      {
        type: 'input',
        name: 'ticketNumber',
        message: messages.ticketNumber,
        when() {
          return !!config.allowTicketNumber; // no ticket numbers allowed unless specifed
        },
        validate(value) {
          return isValidateTicketNo(value, config);
        },
      },
      {
        type: 'input',
        name: 'subject',
        message: messages.subject,
        validate(value) {
          if (!value) {
            return '请输入关于此次改动的简短描述~';
          }
          const limit = config.subjectLimit || 100;
          if (value.length > limit) {
            return `请注意简短描述的最长字符数为 ${limit}`;
          }
          return true;
        },
        filter(value) {
          const upperCaseSubject = config.upperCaseSubject || false;

          return (upperCaseSubject ? value.charAt(0).toUpperCase() : value.charAt(0).toLowerCase()) + value.slice(1);
        },
      },
      {
        type: 'input',
        name: 'body',
        message: messages.body,
      },
      {
        type: 'input',
        name: 'breaking',
        message: messages.breaking,
        when(answers) {
          // eslint-disable-next-line max-len
          if (
            config.askForBreakingChangeFirst ||
            (config.allowBreakingChanges && config.allowBreakingChanges.indexOf(answers.type.toLowerCase()) >= 0)
          ) {
            return true;
          }
          return false; // no breaking changes allowed unless specifed
        },
      },
      {
        type: 'input',
        name: 'footer',
        message: messages.footer,
        validate: function (input) {
          if (!input) {
            return '请输入与此次改动相关联的Jira号~';
          } else {
            var patt = /^(\w+-\d+)$/;
            if (!patt.test(input)) {
              return 'Jira号的格式不对, 请重新输入';
            } else {
              return true;
            }
          }
        },
      },
      {
        type: 'list',
        name: 'confirmCommit',
        choices: [
          { key: 'y', name: 'Yes', value: 'yes' },
          { key: 'n', name: 'Abort commit', value: 'no' },
          { key: 'e', name: 'Edit message', value: 'edit' },
        ],
        default: 0,
        message(answers) {
          const SEP = '###--------------------------------------------------------###';
          log.info(`\n${SEP}\n${buildCommit(answers, config).commitMessage}\n${SEP}\n`);
          return messages.confirmCommit;
        },
      },
    ];

    questions = questions.filter((item) => !skipQuestions.includes(item.name));

    if (config.askForBreakingChangeFirst) {
      const isBreaking = (oneQuestion) => oneQuestion.name === 'breaking';

      const breakingQuestion = _.filter(questions, isBreaking);
      const questionWithoutBreaking = _.reject(questions, isBreaking);

      questions = _.concat(breakingQuestion, questionWithoutBreaking);
    }

    return questions;
  },
};