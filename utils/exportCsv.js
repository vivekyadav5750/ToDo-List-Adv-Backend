const { Parser } = require('json2csv');

exports.exportToCsv = (todos) => {
  const fields = [
    'id',
    'title',
    'description',
    'priority',
    'completed',
    'tags',
    'assignedUsers',
    'createdAt',
    'updatedAt',
  ];

  const data = todos.map((todo) => ({
    ...todo._doc,
    tags: todo.tags.join(', '),
    assignedUsers: todo.assignedUsers.join(', '),
  }));

  const parser = new Parser({ fields });
  return parser.parse(data);
};