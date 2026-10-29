(function(){
 var p=location.pathname.split('/').pop()||'index.html', m=window.innerWidth<=760;
 if(p==='index.html'&&m){location.replace('home-mobile.html');return;}
 if(p==='home-mobile.html'&&!m){location.replace('index.html');return;}
 document.addEventListener('DOMContentLoaded',function(){
  var d=document.createElement('div');d.className='pv-menu';
  d.innerHTML='<div class="x">X</div><a href="index.html#services">Services</a><a href="plans-builder.html">Plans</a><a href="how-we-work.html">How we work</a><a href="about.html">About</a><a class="ai" href="ai-knows.html"><span class="t">Does AI know your business?</span></a><a class="cta" href="contact.html">Book a call</a>';
  document.body.appendChild(d);
  d.querySelector('.x').onclick=function(){d.classList.remove('open')};
  document.querySelectorAll('.burger').forEach(function(b){b.onclick=function(){d.classList.add('open')}});
 });
})();
