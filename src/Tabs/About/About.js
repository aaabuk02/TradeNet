import { ExternalLinkIcon, EmailIcon } from "@chakra-ui/icons";
import { Grid, GridItem, Heading, Link, Text } from "@chakra-ui/react";

const About = () => {
  return (
    <div>
      <Grid templateColumns="1fr" gap={10} maxWidth="55rem">
        <GridItem>
          <Heading fontSize="5xl" as="b">
            Welcome To TradeNet 🏀
          </Heading>
        </GridItem>
        <GridItem>
          <Text fontSize="xl">
            Trades are one of the most interesting parts about the NBA and can
            have a domino effect for future transactions to come. This
            application allows users to explore the history of NBA player
            transactions by visualizing them as a graph.
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="xl">
            To build the graph, simply select a player and (optionally) another
            player who has been involved in a trade with them. You can also
            specify the number of additional exchanges to include in the graph,
            allowing you to control its size and complexity. Click the edges
            between nodes for extra information!
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="xl">
            Data source is from the amazing{"  "}
            <Link href="https://prosportstransactions.com/" isExternal>
              prosportstransactions.com
              <ExternalLinkIcon mx="2px" />
            </Link>{" "}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="xl">
            Inspired by this{" "}
            <Link
              href="https://svitkin.shinyapps.io/bball-trade-network/"
              isExternal
            >
              project
              <ExternalLinkIcon mx="2px" />
            </Link>
          </Text>
        </GridItem>
        <GridItem>
          <Link href="https://github.com/aaabuk02/trade-net" isExternal>
            Source Code
            <ExternalLinkIcon mx="2px" />
          </Link>
          <br />
          <Link href="mailto:aaabuk02@gmail.com" isExternal>
            Contact Me
            <EmailIcon mx="2px" />
          </Link>
        </GridItem>
      </Grid>
    </div>
  );
};

export default About;
