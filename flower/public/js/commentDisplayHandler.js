const getTDFormat = function(str){
 return `<td>${str}</td>`;
}

const getTRFormat = function(str){
 return `<tr>${str}</tr>`;
}

const getCommentToHTML = function(comment){
 let str = getTDFormat(comment.date)+getTDFormat(comment.Name)+getTDFormat(comment.Comment);
 return getTRFormat(str);
}

const getAllComments = function(comments){
 return comments.map(function(comment){
   return getCommentToHTML(comment);
 }).join(‘’);
}


const getComments = function(commentsData){
 document.getElementById('comment').innerHTML = getAllComments(commentsData);
}

const displayComments=function(){
  return getComments(comments);
}
