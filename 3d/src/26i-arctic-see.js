/* ❄️ Polar Ice for friends online (after 26c-friends-see.js, which makes SHOW): friends see the ice skates on your feet
   while you skate (iceBlades in 24m-arctic.js; the skating stride comes from the rollerPose they already use). */
SHOW.push({k:'ice',mine(){return ICS.on?{on:1}:null;},on(f){iceBlades(f.a,true);return {};},step(f){if(f.a&&!f.a.iceB)iceBlades(f.a,true);},off(f){iceBlades(f.a,false);}});
