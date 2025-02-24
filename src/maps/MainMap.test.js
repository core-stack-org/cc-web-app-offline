import React from "react";
import { shallow } from "enzyme";
import OpenLayers from "./OpenLayers";

describe("OpenLayers", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<OpenLayers />);
    expect(wrapper).toMatchSnapshot();
  });
});
