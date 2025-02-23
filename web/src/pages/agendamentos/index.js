import { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import util from "../../util";
import { filterAgendamentos } from "../../store/modules/agendamento/actions";

const localizer = momentLocalizer(moment);

const Agendamentos = () => {
  const dispatch = useDispatch();
  const { agendamentos } = useSelector((state) => state.agendamento);

  const formatEventos = () => {
    const listaEventos = agendamentos.map((agendamento) => ({
      resource: { agendamento },
      title: `${agendamento.servicoId.titulo}\n - ${agendamento.clienteId.nome}\n - ${agendamento.colaboradorId.nome}`,
      start: moment(agendamento.data).toDate(),
      end: moment(agendamento.data)
        .add(agendamento.servicoId.duracao, "minutes")
        .toDate(),
    }));

    console.log(listaEventos);
    return listaEventos;
  };
  // executa a ação todacada vez que a página é carregada
  useEffect(() => {
    dispatch(
      filterAgendamentos({
        start: moment().weekday(0).format("YYYY-MM-DD"),
        end: moment().weekday(6).format("YYYY-MM-DD"),
      })
    );
    //pegando o primeiro dia da semana
    //start: moment().weekday(0).format("YYYY-MM-DD"),
    //pegando o último dia da semana
    //end: moment().weekday(6).format("YYYY-MM-DD"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="col p-5 h-100 overflow-auto">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4 mt-0">Agendamentos</h2>
          <Calendar
            localizer={localizer}
            events={formatEventos()}
            selectable
            popup
            defaultView="week"
            style={{ height: 600 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Agendamentos;
