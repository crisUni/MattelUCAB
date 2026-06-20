import { serve } from "bun";
import index from "./index.html";

import RolService from "./api/RolService";
import DescuentoService from "./api/DescuentoService";
import JugueteService from "./api/JugueteService";
import PagoService from "./api/PagoService";
import ProductoService from "./api/ProductoService";
import EmpleadoService from "./api/EmpleadoService";
import InspeccionService from "./api/InspeccionService";
import AlmacenService from "./api/AlmacenService";
import ClienteService from "./api/ClienteService";
import UsuarioService from "./api/UsuarioService";
import SubastaService from "./api/SubastaService";
import CompraService from "./api/CompraService";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    ...DescuentoService.routes,
    ...JugueteService.routes,
    ...PagoService.routes,
    ...ProductoService.routes,
    ...EmpleadoService.routes,
    ...RolService.routes,
    ...InspeccionService.routes,
    ...AlmacenService.routes,
    ...ClienteService.routes,
    ...UsuarioService.routes,
    ...SubastaService.routes,
    ...CompraService.routes,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
