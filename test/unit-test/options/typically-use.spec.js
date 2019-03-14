import Vue from "vue";
import options from "./options";

function getRenderedText (Component, propsData){
  const Constructor = Vue.extend(Component);
  const vm          = new Constructor({ propsData: propsData }).$mount()
  return vm.$el.textContent
}

describe("typically", function (){
  it("init", function (){
    expect(1).toBe(1);
  })
})

