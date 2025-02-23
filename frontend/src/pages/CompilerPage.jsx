import { Box } from "@chakra-ui/react";
import CodeEditor from "../components/compiler/CodeEditor";
import Navbar from "../components/navbar/Navbar";
function CompilerPage() {

    return (<>
    <Navbar /> 
    <br/> <br/> <br/> <br/>
    <Box minH="80vh" bg="#FFF" color="gray.500" px={500} py={10}>
      <CodeEditor />
    </Box>
    </>)
};

export default CompilerPage;
