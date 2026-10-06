(function(){var n=document.getElementById('catnav');if(!n)return;var w=n.parentNode,l=w.querySelector('.arrow.left'),r=w.querySelector('.arrow.right');
function u(){var m=n.scrollWidth-n.clientWidth;l.hidden=n.scrollLeft<=2;r.hidden=n.scrollLeft>=m-2;w.classList.toggle('fl',!l.hidden);w.classList.toggle('fr',!r.hidden);}
function go(d){n.scrollBy({left:d*n.clientWidth*0.75,behavior:'smooth'});setTimeout(u,450);setTimeout(u,900);}
l.addEventListener('click',function(){go(-1)});
r.addEventListener('click',function(){go(1)});
n.addEventListener('scroll',u,{passive:true});n.addEventListener('scrollend',u);addEventListener('resize',u);u();
n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){a.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})})});})();
