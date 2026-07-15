const { db } = require('../database');

function getAllThreads(sort = 'recent', cb) {
  const sortColumn = sort === 'popular' ? 'likes' : sort === 'commented' ? 'replies' : 'created_at';
  const direction = sort === 'popular' || sort === 'commented' ? 'DESC' : 'DESC';
  const sql = `SELECT threads.id, threads.author, threads.title, threads.content, threads.tags, threads.created_at, threads.image_url, COUNT(DISTINCT likes.id) AS likes, COUNT(DISTINCT replies.id) AS replies FROM threads LEFT JOIN likes ON likes.thread_id = threads.id LEFT JOIN replies ON replies.thread_id = threads.id GROUP BY threads.id ORDER BY ${sortColumn} ${direction}`;
  db.all(sql, [], cb);
}

function createThread({ author, authorId, title, content, tags, imageUrl, createdAt }, cb) {
  const tagsText = JSON.stringify(Array.isArray(tags) ? tags : []);
  db.run(
    'INSERT INTO threads (author, author_id, title, content, tags, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [author, authorId, title, content, tagsText, imageUrl || '', createdAt],
    function (err) {
      if (err) return cb(err);
      cb(null, {
        id: this.lastID,
        author,
        authorId,
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl || '',
        createdAt,
      });
    }
  );
}

module.exports = {
  getAllThreads,
  createThread,
};
