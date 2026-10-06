(function(){var n=document.getElementById('catnav');if(!n)return;var w=n.parentNode,l=w.querySelector('.arrow.left'),r=w.querySelector('.arrow.right');
function u(){var m=n.scrollWidth-n.clientWidth;l.hidden=n.scrollLeft<=2;r.hidden=n.scrollLeft>=m-2;w.classList.toggle('fl',!l.hidden);w.classList.toggle('fr',!r.hidden);}
function go(d){n.scrollBy({left:d*n.clientWidth*0.75,behavior:'smooth'});setTimeout(u,450);setTimeout(u,900);}
l.addEventListener('click',function(){go(-1)});
r.addEventListener('click',function(){go(1)});
n.addEventListener('scroll',u,{passive:true});n.addEventListener('scrollend',u);addEventListener('resize',u);u();
n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){a.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})})});})();
(function(){var up=document.querySelector('.vscroll.up'),dn=document.querySelector('.vscroll.down'),nw=document.querySelector('.navwrap');if(!up||!dn)return;
var de=document.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)'),t=0;
function u(){t=0;var y=scrollY,m=de.scrollHeight-innerHeight;up.classList.toggle('show',y>24);dn.classList.toggle('show',y<m-24);if(nw)up.style.setProperty('--vtop',Math.max(nw.getBoundingClientRect().bottom,0)+8+'px');}
function q(){if(!t)t=requestAnimationFrame(u);}
function go(d){scrollBy({top:d*innerHeight*0.7,behavior:rm.matches?'auto':'smooth'});}
up.addEventListener('click',function(){go(-1)});
dn.addEventListener('click',function(){go(1)});
addEventListener('scroll',q,{passive:true});addEventListener('resize',q);addEventListener('load',q);u();})();
