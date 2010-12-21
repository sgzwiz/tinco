Ext.namespace("Ext.ux");

Ext.ux.Canvas = Ext.extend(Ext.BoxComponent, { 
     
    setSize : function(width, height) { 
        this.canvas.height = height; 
        this.canvas.width = width; 
        this.draw(); 
    }, 
         
    autoEl: { tag: 'canvas' },
     
    onRender : function(ct, position){ 
        Ext.ux.Canvas.superclass.onRender.call(this, ct, position); 
         
        this.canvas = this.el.dom; 
        this.ctx = this.canvas.getContext("2d"); 
         
        this.draw(); 
    }, 
     
    draw : function() { 
    } 

});
Ext.reg('x-canvas', Ext.ux.Canvas);
