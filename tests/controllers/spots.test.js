const { index, renderNewForm, createSpot, showSpot, renderEditForm, updateSpot, deleteSpot } = require("../../controllers/spots");
const Spot = require("../../models/spot");
const { cloudinary } = require("../../cloudinary");
const maptilerClient = require("@maptiler/client");

jest.mock("../../models/spot"); // Mock Mongoose Spot model
jest.mock("@maptiler/client"); // Mock MapTiler API
jest.mock("../../cloudinary"); // Mock Cloudinary

describe("Spots Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "123" },
      body: { spot: { location: "New York" } },
      files: [{ path: "image_url", filename: "image_name" }],
      flash: jest.fn(),
      user: { _id: "user123" },
    };
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all spots", async () => {
    Spot.find.mockResolvedValue([{ _id: "123", title: "Test Spot" }]);

    await index(req, res);

    expect(Spot.find).toHaveBeenCalled();
    expect(res.render).toHaveBeenCalledWith("spots/index", { spots: expect.any(Array) });
  });

  it("should render new spot form", () => {
    renderNewForm(req, res);
    expect(res.render).toHaveBeenCalledWith("spots/new");
  });

  it("should create a new spot", async () => {
    maptilerClient.geocoding.forward.mockResolvedValue({
      features: [{ geometry: { type: "Point", coordinates: [40, -73] } }],
    });

    Spot.prototype.save = jest.fn().mockResolvedValue();
    
    await createSpot(req, res, next);

    expect(maptilerClient.geocoding.forward).toHaveBeenCalledWith("New York", { limit: 1 });
    expect(res.redirect).toHaveBeenCalled();
  });

  // More tests for showSpot, renderEditForm, updateSpot, deleteSpot...
});
