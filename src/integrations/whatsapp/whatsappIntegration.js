import { AuthenticationService, ParentService, StudentService, AttendanceService, FeeBalanceService, ResultsService, DisciplineService, TicketService, OTPService, SessionService, NotificationService } from '../../services/index.js';
import { ParentRepository, StudentRepository, AttendanceRepository, FeeRepository, ResultsRepository, DisciplineRepository, TicketRepository, OTPRepository, SessionRepository, NotificationRepository } from '../../repositories/index.js';
import { AuthenticationPolicy, AuthorizationPolicy, FormerStudentPolicy, OTPPolicy, SessionPolicy, TicketPolicy } from '../../policies/index.js';
import { MessageProcessor, SessionManager, CommandRegistry, IntentResolver, StateMachine, ResponseBuilder, MenuBuilder } from '../../conversation/index.js';
import { ServiceLayerAdapter } from './ServiceLayerAdapter.js';

export const buildWhatsAppIntegration = ({ config, logger, connectorRegistry } = {}) => {
  const parentRepository = new ParentRepository({ registry: connectorRegistry, logger });
  const studentRepository = new StudentRepository({ registry: connectorRegistry, logger });
  const attendanceRepository = new AttendanceRepository({ registry: connectorRegistry, logger });
  const feeRepository = new FeeRepository({ registry: connectorRegistry, logger });
  const resultsRepository = new ResultsRepository({ registry: connectorRegistry, logger });
  const disciplineRepository = new DisciplineRepository({ registry: connectorRegistry, logger });
  const ticketRepository = new TicketRepository({ registry: connectorRegistry, logger });
  const otpRepository = new OTPRepository({ registry: connectorRegistry, logger });
  const sessionRepository = new SessionRepository({ registry: connectorRegistry, logger });
  const notificationRepository = new NotificationRepository({ registry: connectorRegistry, logger });

  const authenticationPolicy = new AuthenticationPolicy();
  const authorizationPolicy = new AuthorizationPolicy();
  const formerStudentPolicy = new FormerStudentPolicy();
  const otpPolicy = new OTPPolicy();
  const sessionPolicy = new SessionPolicy();
  const ticketPolicy = new TicketPolicy();

  const sessionService = new SessionService({ sessionRepository, sessionPolicy, logger });
  const otpService = new OTPService({ otpRepository, otpPolicy, logger });
  const notificationService = new NotificationService({ notificationRepository, logger });
  const authenticationService = new AuthenticationService({ parentRepository, otpService, sessionService, notificationService, authenticationPolicy, logger });
  const parentService = new ParentService({ parentRepository, authorizationPolicy, logger });
  const studentService = new StudentService({ studentRepository, formerStudentPolicy, authorizationPolicy, parentService, logger });
  const attendanceService = new AttendanceService({ attendanceRepository, studentRepository, authorizationPolicy, logger });
  const feeBalanceService = new FeeBalanceService({ feeRepository, studentRepository, authorizationPolicy, logger });
  const resultsService = new ResultsService({ resultsRepository, studentRepository, authorizationPolicy, logger });
  const disciplineService = new DisciplineService({ disciplineRepository, studentRepository, authorizationPolicy, logger });
  const ticketService = new TicketService({ ticketRepository, ticketPolicy, logger });

  const serviceLayer = new ServiceLayerAdapter({
    services: {
      authenticationService,
      parentService,
      studentService,
      attendanceService,
      feeBalanceService,
      resultsService,
      disciplineService,
      ticketService
    },
    logger
  });

  const sessionManager = new SessionManager({ sessionRepository, clock: () => new Date() });
  const commandRegistry = new CommandRegistry();
  const intentResolver = new IntentResolver();
  const stateMachine = new StateMachine();
  const menuBuilder = new MenuBuilder();
  const responseBuilder = new ResponseBuilder({ menuBuilder });

  const messageProcessor = new MessageProcessor({
    sessionManager,
    commandRegistry,
    intentResolver,
    stateMachine,
    responseBuilder,
    menuBuilder,
    serviceLayer
  });

  return { messageProcessor };
};
