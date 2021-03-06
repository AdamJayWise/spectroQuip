console.log('spectroQuip C2020 Adam Wise');
debug = 1;

// What would be a neat next step?
// maybe clarify something complicated?
// how to make a parts list? (iterate over slots and check rules to print parts list)
// how to enforce rules

// maybe you can configure a spectrometer using pull downs?

// create an object-oriented spectrometer (to start) configurator
//  I want the eventual goal to be a GUI that allows dragging objects into slots on a spectrometer 
// to start maybe just boxes

// so there should be an 'item' class that has some number (>=0) of 'slots' that can hold other items
// and each item can also hold 'rules' objects that need to be fulfilled when the validate method gets run on them

// how does a slot work?  is a slot a class?  a slot should have a type and maybe some requirements?

// maybe the first case is a spectrometer getting configured with a camera, so it has one camera slot


// helper function to convert string pixel value to number
function p(s){
    return Number(s.split('px')[0]);
}

function Slot(configObj){
    var self = this;
    // if no configuration object provided, use these default values
    if (!configObj){
        // object with default configuration values
        var configObj = {
            'name' : 'defaultObj',
            'type' : none,
            'parent' : none,
        };
    };

    // copy config keys to object scope
    Object.keys(configObj).forEach(function(k){
        self[k] = configObj[k];
    });


}


function Rule(configObj){
    // if no configuration object provided, use these default values
    if (!configObj){
        // object with default configuration values
        var configObj = {

        }
    }
}

function Item(configObj){
    var self = this;
    
    // default object properties
    self.name = 'defaultObj';
    self.type = null;
    self.slots = []; // array of slot objects to hold other items
    self.parentDivSelector = 'body'; // where to append graphical representation to
    self.width = 30; // width of graphical representation in pixels
    self.height = 30; //height of graphical representation in pixels
    self.x =  0;
    self.y = 0;

    // copy config keys to object scope
    Object.keys(configObj).forEach(function(k){
        self[k] = configObj[k];
    });

    // draw a graphical representation using a div
    self.parentDiv = d3.select(self.parentDivSelector);
    self.div = self.parentDiv.append('div').classed('item', true);
    self.div.style('position', 'absolute');
    self.div.style('height', self.height);
    self.div.style('width', self.width);
    self.div.style('left', self.x);
    self.div.style('top', self.y);
    self.div.style('background-color', 'gray');

    if (self.fill){
        self.div.style('background-color', self.fill);
    }


    //make div draggable
    self.div.call(d3.drag().on("drag", dragging).on('end', endDrag));

    function dragging(){    
        self.div.style('z-index', 100); 
        self.div.style('left', Number(self.div.style('left').split('px')[0]) + d3.event.dx)
        self.div.style('top', Number(self.div.style('top').split('px')[0]) + d3.event.dy)

        for (var i in self.slots){
            var currentItem = self.slots[i].item;
            if (currentItem){
                var offSetX = self.slots[i].x;
                var offSetY = self.slots[i].y;
                currentItem.div.style('left', Number(self.div.style('left').split('px')[0]) + d3.event.dx + offSetX)
                currentItem.div.style('top', p(self.div.style('top')) + offSetY)
            }
        
        }

    }

    function endDrag(){

        thisItem = d3.select(this)
    
        if (debug){
            console.log(`ending drag session of ${d3.select(this)} mouse at ${d3.event.x}, ${d3.event.y}`);
        }

        var landedOnItem = null;
        var landedOnSlot = null;

        // check to see if mouse is inside another item's slots when dragging stops
        for (var i in items){
            for (var s in items[i].slots){
                // left bound of slot in main div coord system: item.left + slot.left to item.left + slot.left + slot.width
                var thisSlot = items[i].slots[s];
                
                if(debug){
                    console.log( p(items[i].div.style('top')) + thisSlot.y ) 
                    console.log( (p(items[i].div.style('top')) + thisSlot.y + thisSlot.height) )
                }
                
                var insideX = (d3.event.x > (p(items[i].div.style('left')) + thisSlot.x)) & (d3.event.x < (p(items[i].div.style('left')) + thisSlot.x + thisSlot.width))
                var insideY = (d3.event.y > (p(items[i].div.style('top')) + thisSlot.y)) & (d3.event.y < (p(items[i].div.style('top')) + thisSlot.y + thisSlot.height))

                if (insideX & insideY){
                    console.log('ding');
                    landedOnItem = items[i];
                    landedOnSlot = thisSlot;
                    break
                }
            }
            if (landedOnSlot){
                break
            }
        }

        if (debug){
            console.log(landedOnSlot, landedOnItem);
        }

        if (landedOnItem && landedOnSlot){
            if (debug) console.log('equipping')
            // if a draggable item landed on a slot, try to equip it to that slot
            self.equipTo(landedOnSlot);
        }

        if (landedOnSlot == null){
            self.unEquip();
        }
    }
    

    // equip to other item's slot function
    self.equipTo = function(targetSlot){
        // check if slot type is the same
        if (self.type != targetSlot.type){
            console.log('error: trying to equip to incorrect slot type')
            return -1;
        }

        // if everything is ok, add this item to the target slot
        if (debug){
            console.log('equipping')
        }

        targetSlot.item = self;
        self.equippedTo = targetSlot;
        
        // todo position div to snap to slot
        
    }

    self.unEquip = function(){
        if(self.equippedTo){
            self.equippedTo.item = null;    
        }
        self.equippedTo = null;
    }

    self.drawSlots = function(){
        for(var s in self.slots){
            var thisSlot = self.slots[s];
            var slotDiv = self.div.append('div');
            slotDiv.style('width', thisSlot.width).style('height', thisSlot.height)
            slotDiv.style('border', thisSlot.borderSpec);
            slotDiv.style('position', 'absolute')
            slotDiv.style('left', thisSlot.x)
            slotDiv.style('top', thisSlot.y)
        }
    }

    self.drawSlots();

    // config validation function
    self.validate = function(){

    }

}

var items = [];

var cam1Config = {'name' : 'camera 1',
    'type' : 'camera',
    'parentDivSelector' : '#workSpace',
    'label' : 'Camera 1',
    'fill' : 'red'
};

var cam2Config = {'name' : 'camera 1',
    'type' : 'camera',
    'parentDivSelector' : '#workSpace',
    'label' : 'Camera 2',
    'fill' : 'blue',
    'x' : 100,
    'y' : 100,
};



var camSlot1 = new Slot({'name' : 'directInput',
                    'type':'camera',
                    'x' : 0,
                    'y' : -30,
                    'width': 30,
                    'height' : 30,
                    'borderSpec' : '1px solid red',
                   })

var camSlot2 = new Slot({'name' : 'sideInput',
    'type':'camera',
    'x' : -30,
    'y' : 50,
    'width': 30,
    'height' : 30,
    'borderSpec' : '1px solid red',
})

var ky328Config = {'name' : 'Kymera 328i',
                     'type' : 'spectrometer',
                     'slots' : [camSlot1, camSlot2],
                     'parentDivSelector' : '#workSpace',
                     'label' : 'Kymera 328',
                     'height' : 100,
                     'width' : 100,
                     'x' : 150,
                     'y' : 150,
                    };

var ky328 = new Item(ky328Config);
items.push(ky328)

var cam1 = items.push(new Item(cam1Config));
var cam2 = items.push(new Item(cam2Config));




//cam1.equipTo(ky328.slots[0])