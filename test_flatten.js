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

const results = [...rows];
const argArray = [];

const countTree = (parentNode, currentNode) => {
  let count = 0;
  argArray.push(currentNode);
  
  if (currentNode.replies && currentNode.replies.rows && currentNode.replies.rows.length > 0) {
    currentNode.replies.rows.forEach((reply) => {
      count++;
      if (parentNode.type !== ARGUMENT_TYPES.reply) {
        count += countTree(reply, reply);
        if (reply.children) {
          reply.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      } else {
        count += countTree(parentNode, reply);
        const replyClone = { ...reply };
        replyClone.replies = { count: 0, rows: [] };
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(replyClone);
      }
    });
  }
  
  if (currentNode.type === ARGUMENT_TYPES.reply && currentNode.parent) {
    const parent = argArray.find(arg => arg.id === currentNode.parent.id);
    if (parent) {
      currentNode.parent = Object.assign({}, currentNode.parent, parent);
    }
  }
  
  return count;
};

results.forEach((row) => {
  if (!row.replies) row.replies = { count: 0, rows: [] };
  row.replies.count = countTree(row, row);
});

// Remove circular parent references for printing
const clean = (obj) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(clean);
  if (typeof obj === 'object') {
    const res = {};
    for (let k in obj) {
      if (k === 'parent') res[k] = obj[k].id; // Just keep ID to avoid circle
      else res[k] = clean(obj[k]);
    }
    return res;
  }
  return obj;
};

console.log(JSON.stringify(clean(results), null, 2));
