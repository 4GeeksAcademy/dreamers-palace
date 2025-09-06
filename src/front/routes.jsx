// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Welcome } from "./pages/Welcome";
import { TimelinePage } from "./pages/Timeline";
import { StoryPage } from "./pages/Story";
import { StoryCreation } from "./components/StoryCreation";
import { ChapterCreation } from "./components/ChapterCreation";
import { ChapterPage } from "./pages/Chapter";
import { WriterPage } from "./pages/Writer";
import { WriterProfile } from "./components/WriterProfile";
import { FollowingWritter } from "./pages/Following";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { VisitorPage } from "./pages/VisitorPage";
<<<<<<< HEAD
import { StoryWithChapters } from "./components/StoryWithChapters";
import { ChapterReader } from "./components/ChapterReader";
import { Libro } from "./components/Libro";
=======
import { Libro } from "./pages/Libro";
import { CapituloO } from "./pages/CapituloO";
import { StoryWithChapters } from "./components/StoryWithChapters";
import { ChapterReader } from "./components/ChapterReader";
import { ChapterEdit } from "./components/ChapterEdit";

>>>>>>> 94ff9454ac8fbe2826087ac6a5bb8db2cd62c069

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<LoginPage />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/story/new" element={<StoryCreation />} />
      <Route path="/story/:id" element={<StoryWithChapters />} />
      <Route path="/story/:id/chapters/new" element={<ChapterCreation />} />
      <Route path="/story/:id/chapters/:chapterId" element={<ChapterReader />} />
      <Route path="/story/:id/chapters/:chapterId/edit" element={<ChapterEdit />} />
      <Route path="/chapter" element={<ChapterPage />} />
      <Route path="/writerpage" element={<WriterPage />} />
      <Route path="/writer" element={<WriterProfile />} />
      <Route path="/following" element={<FollowingWritter />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recovery" element={<RecoveryPage />} />
      <Route path="/visitor" element={<VisitorPage />} />
      <Route path="/libro" element={<Libro />} />
      <Route path="/capituloO" element={<CapituloO />} />
    </Route>
  )
);