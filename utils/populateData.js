const { TestFramework } = require("./testFramework");

const testingFramework = new TestFramework();

const populateData = async () => {
  // Generate Event Tags
  const artists = await testingFramework.generateArtists(50);
  const buyers = await testingFramework.generateUsers(50);
  const artistsIds = artists.map((artist) => artist._id);
  const buyersIds = buyers.map((buyer) => buyer._id);

  // Generate Organizers
  const artistsRatings = await testingFramework.generateArtistsRatings(
    100,
    artistsIds,
    buyersIds
  );
  const artworks = await testingFramework.generateArtworks(100, artistsIds);
  const artworkIds = artworks.map((artwork) => artwork._id);
  const artworksBids = await testingFramework.generateArtworksBids(
    5,
    artworkIds,
    buyersIds
  );
  const wonArtworks = await testingFramework.generateWonArtworks(
    20,
    artworkIds,
    buyersIds
  );
  // const wonArtworksIds = wonArtworks.map((wonArtwork) => wonArtwork._id);
  const walletBuyers = await testingFramework.generateWalletBuyer(
    50,
    buyersIds
  );
  const walletArtists = await testingFramework.generateWalletArtist(
    50,
    artistsIds
  );
  const buyerProposals = await testingFramework.generateBuyerProposal(
    20,
    buyersIds,
    artistsIds
  );
  const buyerProposalsIds = buyerProposals.map((proposal) => proposal._id);

  const acceptedProposals = await testingFramework.generateAcceptedProposal(
    10,
    buyersIds,
    artistsIds,
    buyerProposalsIds
  );

  const centralBank = await testingFramework.generateCentralBanks(
    50,
    buyersIds,
    artistsIds,
    buyerProposalsIds
  );

  const reports = await testingFramework.generateReports(
    50,
    buyersIds,
    artistsIds
  );
  //   const artworkIds = organizers.map((organizer) => organizer._id);
};

module.exports = { populateData };
