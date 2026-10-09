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

let results = rows.concat([]);
const argArray = [];
const countTree = (parentNode, currentNode) => {
  argArray.push(currentNode);
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
  if (currentNode.type === ARGUMENT_TYPES.reply && currentNode.parent) {
    const parent = argArray.find((arg) => arg.id === currentNode.parent.id);
    if (parent) {
       currentNode.parent = Object.assign({}, currentNode.parent, parent);
    }
  }
};

results.forEach((row) => {
  row.replies.count = countTree(row, row);
});

const clean = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(clean);
  if (typeof obj === 'object') {
    const res = {};
    for (let k in obj) {
      if (k === 'parent') res[k] = obj[k].id; 
      else res[k] = clean(obj[k]);
    }
    return res;
  }
  return obj;
};

console.log(JSON.stringify(clean(results), null, 2));
