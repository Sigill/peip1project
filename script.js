var canvas = document.getElementById("canvas");
if(canvas.getContext){
	function setCookie(sName, sValue) {
		var today = new Date(), expires = new Date();
		expires.setTime(today.getTime() + (365*24*60*60*1000));
		document.cookie = sName + "=" + encodeURIComponent(sValue) + ";expires=" + expires.toGMTString();
	}

	function getCookie(sName) {
		var cookContent = document.cookie, cookEnd, i, j;
		var sName = sName + "=";
		
		for (i=0, c=cookContent.length; i<c; i++) {
			j = i + sName.length;
			if (cookContent.substring(i, j) == sName) {
				cookEnd = cookContent.indexOf(";", j);
				if (cookEnd == -1) {
					cookEnd = cookContent.length;
				}
				return decodeURIComponent(cookContent.substring(j, cookEnd));
			}
		}       
		return null;
	}
	var ctx = canvas.getContext("2d");
		//import des classes les plus utilisées sur box2DWeb
		var b2Vec2 = Box2D.Common.Math.b2Vec2;
		var b2BodyDef = Box2D.Dynamics.b2BodyDef;
		var b2Body = Box2D.Dynamics.b2Body;
		var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
		var b2Fixture = Box2D.Dynamics.b2Fixture;
		var b2World = Box2D.Dynamics.b2World;
		var b2MassData = Box2D.Collision.Shapes.b2MassData;
		var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
		var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
		var world= new b2World(new b2Vec2(0,0),true); //création d'un monde
		var scale = 30; //échelle
		var on = true;
		var r = 0;
		var times = 1;
		var valeur_r = Math.PI/200;
		var width = canvas.width;
		var height = canvas.height;
		var canon_on =on;
		var score_tot = 0;
		var balls = [];
		var taper = null;
		var g_o = false;
		var sound_go = 0;

		createjs.Sound.registerSound({src:"laser.mp3", id:"sound"});
		createjs.Sound.registerSound({src:"pop.mp3", id:"sound2"});
		createjs.Sound.registerSound({src:"gameo.wav",id:"game_ov"});


		if(getCookie("b_score")==null){
			setCookie("b_score",score_tot);
			document.getElementById("best_score").innerHTML = getCookie("b_score");

		}else{
			document.getElementById("best_score").innerHTML = getCookie("b_score");
			
		}


		var listener = new Box2D.Dynamics.b2ContactListener;


		listener.BeginContact = function(contact){
			var shapeA = contact.GetFixtureA();
			var shapeB = contact.GetFixtureB();
			if(contact.GetFixtureA().GetBody().GetContactList().contact.m_fixtureA.m_aabb.upperBound.y<((height-80)/scale) || contact.GetFixtureA().GetBody().GetContactList().contact.m_fixtureB.m_aabb.upperBound.y<((height-80)/scale)){
				taper = true;
			}else{
				taper =false;
			}
			console.log(taper);
			createjs.Sound.play("sound2");
			if(shapeA.m_shape.m_type==0){
				console.log(shapeB.GetBody().m_userData.score);
				shapeB.GetBody().m_userData.score--;
				console.log(shapeB.GetBody().m_userData.score);
				if(shapeB.GetBody().m_userData.score == 0){
					shapeB.GetBody().SetUserData("remove");
					score_tot++;
				}
			}
		}

		function verifi(){
			if(taper==true && (balls[balls.length-1].center.y+balls[balls.length-1].radius)*scale>=canvas.height-80){
				g_o = true;
				if(sound_go==0 && g_o){
					createjs.Sound.play("game_ov");
					sound_go++;
				}
				for(var worldBody = world.GetBodyList();worldBody; worldBody = worldBody.GetNext()){
					world.DestroyBody(worldBody);
				}
				for(var w = 0;w<balls.length;w++){
					balls.splice(w,1);
				}
				
			}

		}


		function debugDraw(){ //fonction dessin
			var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(ctx);
			debugDraw.SetDrawScale(30.0);
			debugDraw.SetFillAlpha(1);
			debugDraw.SetLineThickness(0.5);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);
		}

		function createWall(width,height,x,y){ //créatioin des murs statics
			var bodyDef = new b2BodyDef();
			bodyDef.type = b2Body.b2_staticBody;
			var fixtureDef = new b2FixtureDef();
			fixtureDef.shape = new b2PolygonShape();
			fixtureDef.density = 1;
			bodyDef.position.Set(x,y);
			fixtureDef.shape.SetAsBox(width/scale,height/scale);
			world.CreateBody(bodyDef).CreateFixture(fixtureDef);
		}

	    function findR(x,y){ //taille du rayon de la ball qui vient d'êtrre lancée
	    var un = x - balls[balls.length -1].radius;
	    var deux = y - balls[balls.length-1].radius;
	    var trois = (canvas.width-2) -(x+balls[balls.length -1].radius);
	    var quatre = (canvas.height - 80) - (y+balls[balls.length-1].radius);
	    var cinq = (canvas.height)-(y+balls[balls.length-1].radius)
	    var lng = 0;
	    var r = Math.abs(Math.min(un,deux,trois,quatre)/scale);
	    for(var i = 0;i<balls.length;i++){
	    	var x_0 = (balls[i].center.x)*scale;
	    	var y_0 = (balls[i].center.y)*scale;
	    	lng = Math.sqrt((x-x_0)*(x-x_0)+(y-y_0)*(y-y_0))/scale - (balls[i].radius + balls[balls.length-1].radius);
	    	if(lng!=-1)
	    		if(lng+balls[balls.length-1].radius<r)
	    			r=Math.abs(lng)+balls[balls.length-1].radius;
	    	}

	    	return r;
	    }


	    function ball(){
	    	taper =false;
	    	createjs.Sound.play("sound");
	    	var bodyDef = new b2BodyDef();
	    	bodyDef.type = b2Body.b2_dynamicBody;
			bodyDef.linearDamping = 1; //arrêter la balle ! 
			var fixtureDef = new b2FixtureDef();
			fixtureDef.shape =new b2CircleShape();
			fixtureDef.shape.SetRadius(15/scale);
			fixtureDef.density = 1;
			fixtureDef.restitution = 0.45;
			fixtureDef.friction = 0;
			bodyDef.position.Set((canvas.width/2+Math.cos(r)*70)/scale,((canvas.height+Math.sin(r)*70))/scale);
			bodyDef.userData = {
				score:3,
				ball:true,
				rayon:fixtureDef.shape.GetRadius()
			};
			var body = world.CreateBody(bodyDef);
			body.CreateFixture(fixtureDef);
			
			body.ApplyImpulse(new b2Vec2(90+(r*180/Math.PI),-15),body.GetWorldCenter());
			
			balls[balls.length]={
				bodyD : bodyDef,
				radius : fixtureDef.shape.GetRadius(),
				vitesse: body.GetLinearVelocity(),
				center : body.GetWorldCenter(),
				froze : false,
				verifed :0,
				stop : function(){
					body.SetType(b2Body.b2_staticBody);
					this.froze = true;
					canon_on = true;
					
				},
				ray : function(){
					fixtureDef.shape.SetRadius(findR(this.center.x*scale,this.center.y*scale));
					this.radius = fixtureDef.shape.GetRadius();
					bodyDef.userData.rayon = this.radius;
					body.CreateFixture(fixtureDef);
					
				},
				userdata:bodyDef.userData
			}
		}



		function canon(){

			if(times==200){
				valeur_r= -valeur_r;
				times=1;
			}

			if(canon_on){
				times ++;
				r-=valeur_r;
			}
			
			ctx.beginPath();
			ctx.strokeStyle = "white";
			ctx.moveTo(0,height-80)
			ctx.lineTo(width,height-80);
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = "white";
			ctx.fillRect(width/2-30,height-22,60,25);
			ctx.beginPath();
			ctx.arc(width/2,height-20,30,0,Math.PI,true);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.closePath();
			ctx.save();
			ctx.translate(canvas.width/2,canvas.height-20);
			ctx.rotate(r);
			ctx.fillStyle = "white";
			ctx.fillRect(0,-10,50,24);
			ctx.restore();
		}	

		function update() {  //update le truc !
			ctx.lineWidth = 1;
			world.Step(1/60,8,10);
			for(var worldBody = world.GetBodyList();worldBody; worldBody = worldBody.GetNext()){
				if(worldBody.GetUserData()=="remove"){
					world.DestroyBody(worldBody);
				}
			}
			for(var j = 0;j<balls.length;j++){
				if(balls[j].userdata.score==0){
					balls.splice(j,1);
				}
			}
			world.DrawDebugData();
			world.ClearForces();
			for(worldBody = world.GetBodyList();worldBody;worldBody = worldBody.GetNext()){
				if(worldBody.m_userData!=null){
					if(worldBody.m_userData.ball){
						ctx.beginPath();
						ctx.arc(worldBody.GetPosition().x*scale,worldBody.GetPosition().y*scale,worldBody.m_userData.rayon*scale,0,2*Math.PI,false);
						ctx.fillStyle = "#c0e3f7";
						ctx.fill();
						ctx.closePath();
						ctx.font = (worldBody.m_userData.rayon*20).toString()+"pt impact";
						ctx.strokeStyle ="black";
						ctx.fillStyle ="black";
						
						ctx.fillText(worldBody.m_userData.score,worldBody.GetPosition().x*scale-6*worldBody.m_userData.rayon,worldBody.GetPosition().y*scale+10*worldBody.m_userData.rayon);

						
					}
				}else{

				}
			}

			var length = balls.length;
			if(balls[length-1]!=undefined){
				if(Math.abs(balls[length-1].vitesse.x) < 0.2 && Math.abs(balls[length-1].vitesse.y) <0.1){
					if(balls[length-1].froze==false){
						balls[length-1].stop();
						balls[length-1].ray();
					}
					on = true;
				}else{
					on = false;
				}
				verifi();

			}
			if(g_o){
				ctx.font = "50px Orbitron";
				ctx.fillStyle ="red";
				ctx.fillText("Game over",35,250);
			}	
			
			canon();


			document.getElementById("score").innerHTML = score_tot;
			if(score_tot>=(+getCookie("b_score"))){
				setCookie("b_score",score_tot);
				document.getElementById("best_score").innerHTML = getCookie("b_score");
			}
			ctx.lineWidth = 4;
			ctx.strokeStyle = "#3348ea";
			ctx.strokeRect(0,0,width,height);

			

		}
		world.SetContactListener(listener);
		createWall(2,canvas.height,0,0);//commentaire inutile :-)
		createWall(2,canvas.height,canvas.width/scale,0);
		createWall(canvas.width,2,canvas.width/scale,0);
		createWall(canvas.width,2,canvas.width/scale,canvas.height/scale);
		//terrain
		 //contient toutes les balles
		 canvas.addEventListener("click",function(e){

		 	if(on && canon_on){
		 		canon_on = false;
		 		ball();
		 	}else if(g_o == true){
		 		ctx.clearRect(0,0,width,height);
		 		createWall(2,canvas.height,0,0);
		 		createWall(2,canvas.height,canvas.width/scale,0);
		 		createWall(canvas.width,2,canvas.width/scale,0);
		 		createWall(canvas.width,2,canvas.width/scale,canvas.height/scale);
		 		for(var w = 0;w<balls.length;w++){
		 			balls.splice(w,1);
		 		}
		 		score_tot = 0;
		 		g_o = false;
		 		taper = false;
		 		canon_on = true;
		 		sound_go = 0;
		 		on = true;
		 	}

		 });
		 debugDraw();
		 window.setInterval(update,1000/60);

		 
		}else{
			alert("Your browser doesn't support HTML5 canvas dickhead");
		}
