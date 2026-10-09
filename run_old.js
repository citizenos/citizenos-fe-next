const ARGUMENT_TYPES = { reply: 'reply', pro: 'pro' };

const rows = [
  {
    id: 'A', type: 'pro',
    replies: {
      rows: [
        {
          id: 'B', type: 'reply', parent: { id: 'A' },
          replies: {
            rows: [
              {
                id: 'C', type: 'reply', parent: { id: 'B' }, createdAt: '2023-01-01',
                replies: {
                  rows: [
                    { id: 'D', type: 'reply', parent: { id: 'C' }, createdAt: '2023-01-02', replies: { rows: [] } }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
];

const countTree = (parentNode, currentNode) => {
  if (currentNode.replies.rows.length > 0) {
    currentNode.replies.rows.forEach((reply) => {
      if (parentNode.type !== ARGUMENT_TYPES.reply) {
        countTree(reply, reply);
      } else {
        countTree(parentNode, reply);
        const replyClone = { ...reply };
        replyClone.replies = [];
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(replyClone);
      }
    });
  }
};

rows.forEach((row) => {
  row.replies.count = countTree(row, row);
});

console.log(rows[0].replies.rows[0].children.length); // B.children length
console.log(rows[0].children ? rows[0].children.length : 0); // A.children length
