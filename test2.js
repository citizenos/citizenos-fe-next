const ARGUMENT_TYPES = { reply: 'reply', pro: 'pro' };

const data_old = {
  id: 'A', type: 'pro', replies: { count: 1, rows: [
    { id: 'B', type: 'reply', createdAt: '2020-01-01', parent: { id: 'A' }, replies: { count: 1, rows: [
      { id: 'C', type: 'reply', createdAt: '2020-01-02', parent: { id: 'B' }, replies: { count: 1, rows: [
        { id: 'D', type: 'reply', createdAt: '2020-01-03', parent: { id: 'C' }, replies: { count: 0, rows: [] } }
      ]} }
    ]} }
  ]}
};

const data_new = JSON.parse(JSON.stringify(data_old));

function countTreeOld(parentNode, currentNode) {
  if (currentNode.replies.rows.length > 0) {
    currentNode.replies.rows.forEach((reply) => {
      if (parentNode.type !== ARGUMENT_TYPES.reply) {
        countTreeOld(reply, reply);
      } else {
        countTreeOld(parentNode, reply);
        const replyClone = { ...reply };
        replyClone.replies = [];
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(replyClone);
      }
    });
  }
}

function countTreeNew(parentNode, currentNode) {
  if (currentNode.replies && currentNode.replies.rows && currentNode.replies.rows.length > 0) {
    currentNode.replies.rows.forEach((reply) => {
      if (parentNode.type !== ARGUMENT_TYPES.reply) {
        countTreeNew(reply, reply);
        if (reply.children) {
          reply.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      } else {
        countTreeNew(parentNode, reply);
        const replyClone = { ...reply };
        replyClone.replies = { count: 0, rows: [] };
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(replyClone);
      }
    });
  }
}

countTreeOld(data_old, data_old);
console.log("OLD APP B children:", data_old.replies.rows[0].children?.map(c => c.id));

countTreeNew(data_new, data_new);
console.log("NEW APP B children:", data_new.replies.rows[0].children?.map(c => c.id));
